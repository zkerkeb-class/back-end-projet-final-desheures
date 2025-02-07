const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");
const Playlist = require("../models/Playlist");

const {
  customMetaphone,
  customLevenshteinDistance
} = require("../utils/metaphone/metaphone");

const CACHE_TTL = 3600;
const searchCache = new Map();
const genresCache = {
  genres: null,
  timestamp: null
};

const SIMILARITY_WEIGHTS = {
  genreWeight: 0.4,
  moodWeight: 0.4,
  tempoWeight: 0.2,
  tempoRange: 10
};

const controller = {
  search: async (req, res) => {
    try {
      const {
        query,
        artist,
        genre,
        mood,
        lyrics,
        similarTo,
        page = 1,
        limit = 20
      } = req.query;
      const skip = (page - 1) * limit;

      let correctedGenre = null;
      if (genre) {
        correctedGenre = await controller.findClosestGenre(genre);
      }

      const results = {
        artists: [],
        albums: [],
        tracks: [],
        playlists: [],
        autoComplete: { suggestions: [] },
        pagination: {
          page,
          limit,
          total: 0
        }
      };

      if (correctedGenre && correctedGenre !== genre) {
        results.correction = {
          original: genre,
          corrected: correctedGenre,
          message: `Recherche effectuée pour "${correctedGenre}" au lieu de "${genre}"`
        };
      }

      if (artist) {
        results.artists = await controller.searchArtistsPhonetically(artist);
      }

      if (similarTo) {
        results.tracks = await controller.findSimilarTracks(
          similarTo,
          SIMILARITY_WEIGHTS
        );
      } else {
        const searchQuery = await controller.buildSearchQuery({
          query,
          genre: correctedGenre || genre,
          mood,
          lyrics
        });

        const [artists, albums, tracks, playlists, total] = await Promise.all([
          await monitorMongoQuery('findArtisteByGenre', 'Artiste', () => Artist.find(searchQuery).skip(skip).limit(limit).exec()),
          await monitorMongoQuery('findAlbumByArtiste', 'Album', () => Album.find(searchQuery).populate("artist").skip(skip).limit(limit).exec()),
          await monitorMongoQuery('findAudioByArtiste', 'Audio', () => Audio.find(searchQuery).populate("artist album").skip(skip).limit(limit).exec()),
          await monitorMongoQuery('findPlaylistByType', 'Playlist', () => Playlist.find(searchQuery).skip(skip).limit(limit).exec()),
          await monitorMongoQuery('countDocuments', 'Audio', () => Audio.countDocuments(searchQuery).exec()),
        ]);

        results.artists = artists;
        results.albums = albums;
        results.tracks = tracks;
        results.playlists = playlists;
        results.pagination.total = total;
      }

      if (query) {
        results.autoComplete.suggestions =
          await controller.getAutocompleteSuggestions(query);
      }

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({
        message: "Une erreur est survenue lors de la recherche.",
        error: error.message
      });
    }
  },

  searchArtistsPhonetically: async (query, maxDistance = 2) => {
    const queryPhonetic = customMetaphone(query);

    return await Artist.aggregate([
      {
        $addFields: {
          phoneticName: {
            $function: {
              body: function (name) {
                return customMetaphone(name);
              },
              args: ["$name"],
              lang: "js"
            }
          },
          phoneticDistance: {
            $function: {
              body: function (name, queryPhonetic) {
                return customLevenshteinDistance(
                  customMetaphone(name),
                  queryPhonetic
                );
              },
              args: ["$name", queryPhonetic],
              lang: "js"
            }
          }
        }
      },
      {
        $match: {
          $or: [
            { phoneticDistance: { $lte: maxDistance } },
            { name: new RegExp(query, "i") }
          ]
        }
      },
      {
        $sort: { phoneticDistance: 1 }
      }
    ]);
  },

  findSimilarTracks: async (trackId, options) => {
    const track = await Audio.findById(trackId);
    if (!track) {
      return [];
    }

    return await Audio.aggregate([
      {
        $match: {
          _id: { $ne: track._id },
          genres: { $in: track.genres },
          mood: track.mood,
          tempo: {
            $gte: track.tempo - options.tempoRange,
            $lte: track.tempo + options.tempoRange
          }
        }
      },
      {
        $addFields: {
          similarityScore: {
            $add: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: { $setIntersection: ["$genres", track.genres] }
                      },
                      { $size: track.genres }
                    ]
                  },
                  options.genreWeight
                ]
              },
              {
                $cond: [{ $eq: ["$mood", track.mood] }, options.moodWeight, 0]
              },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          options.tempoRange,
                          { $abs: { $subtract: ["$tempo", track.tempo] } }
                        ]
                      },
                      options.tempoRange
                    ]
                  },
                  options.tempoWeight
                ]
              }
            ]
          }
        }
      },
      {
        $sort: { similarityScore: -1 }
      },
      {
        $limit: 10
      }
    ]);
  },

  getAutocompleteSuggestions: async (query) => {
    const cacheKey = `autocomplete:${query.toLowerCase()}`;

    if (searchCache.has(cacheKey)) {
      const { data, timestamp } = searchCache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_TTL * 1000) {
        return data;
      }
    }

    const autoCompleteRegex = new RegExp(`^${query}`, "i");

    const [artists, tracks] = await Promise.all([
      Artist.find({ name: autoCompleteRegex }).select("name").limit(5),
      Audio.find({ title: autoCompleteRegex }).select("title").limit(5)
    ]);

    const suggestions = [
      ...artists.map((a) => ({ type: "artist", value: a.name })),
      ...tracks.map((t) => ({ type: "track", value: t.title }))
    ];

    searchCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now()
    });

    return suggestions;
  },

  getAvailableGenres: async () => {
    if (
      genresCache.genres &&
      genresCache.timestamp &&
      Date.now() - genresCache.timestamp < CACHE_TTL * 1000
    ) {
      return genresCache.genres;
    }

    const [albumGenres, audioGenres, artistGenres] = await Promise.all([
      await monitorMongoQuery('distinctAlbumByGenre', 'Album', () => Album.distinct("genres").exec()),
      await monitorMongoQuery('distinctAudioByGenre', 'Audio', () => Audio.distinct("genres").exec()),
      await monitorMongoQuery('distinctArtisteByGenre', 'Artiste', () => Artist.distinct("genres").exec())
      ,
      ,
      
    ]);

    const allGenres = Array.from(
      new Set([...albumGenres, ...audioGenres, ...artistGenres])
    );

    genresCache.genres = allGenres;
    genresCache.timestamp = Date.now();

    return allGenres;
  },

  findClosestGenre: async (searchedGenre, maxDistance = 2) => {
    const availableGenres = await controller.getAvailableGenres();
    const searchedPhonetic = customMetaphone(searchedGenre.toLowerCase());

    let closestMatch = null;
    let smallestDistance = Infinity;

    for (const genre of availableGenres) {
      const genrePhonetic = customMetaphone(genre.toLowerCase());
      const distance = customLevenshteinDistance(
        searchedPhonetic,
        genrePhonetic
      );

      if (distance < smallestDistance && distance <= maxDistance) {
        smallestDistance = distance;
        closestMatch = genre;
      }
    }

    return closestMatch || searchedGenre;
  },

  buildSearchQuery: async ({ query, genre, mood, lyrics }) => {
    const searchQuery = {};

    if (query) {
      const keywords = query.split(/\s+/);
      searchQuery.$or = keywords.map((keyword) => ({
        $or: [
          { "artists.name": new RegExp(keyword, "i") },
          { title: new RegExp(keyword, "i") },
          { name: new RegExp(keyword, "i") },
          { lyrics: new RegExp(keyword, "i") }
        ]
      }));
    }

    if (genre) {
      const closestGenre = await controller.findClosestGenre(genre);
      searchQuery.genres = new RegExp(`^${closestGenre}$`, "i");
    }

    if (mood) {
      searchQuery.mood = new RegExp(mood, "i");
    }
    if (lyrics) {
      searchQuery.lyrics = new RegExp(lyrics, "i");
    }

    return searchQuery;
  }
};

module.exports = controller;
