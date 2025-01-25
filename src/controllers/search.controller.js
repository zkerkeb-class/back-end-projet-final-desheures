const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");
const Playlist = require("../models/Playlist");
const config = require("../config");
const {
  customMetaphone,
  customLevenshteinDistance
} = require("../utils/metaphone/metaphone");

module.exports = {
  search: async (req, res) => {
    try {
      const { query, artist, genre, mood, lyrics, similarTo } = req.query;
      config.logger.info("genre : ", genre);
      const results = {
        artists: [],
        albums: [],
        tracks: [],
        playlists: [],
        autoComplete: { suggestions: [] }
      };

      const searchConditions = [];

      if (query) {
        const keywords = query.split(/\s+/);
        const queryPhonetic = customMetaphone(query);

        searchConditions.push({
          $or: [
            ...keywords.map((keyword) => ({
              $or: [
                { "artists.name": new RegExp(keyword, "i") },
                { title: new RegExp(keyword, "i") },
                { name: new RegExp(keyword, "i") },
                { lyrics: new RegExp(keyword, "i") }
              ]
            }))
          ]
        });

        // Recherche phonétique étendue
        const allArtists = await Artist.find({});
        const phoneticArtists = allArtists.filter((a) => {
          const namePhonetic = customMetaphone(a.name);
          const distance = customLevenshteinDistance(
            queryPhonetic,
            namePhonetic
          );
          return distance <= 2;
        });

        results.artists = await Artist.find({
          $or: [
            { _id: { $in: phoneticArtists.map((a) => a._id) } },
            { name: new RegExp(query, "i") },
            { genres: new RegExp(query, "i") }
          ]
        });

        results.tracks = await Audio.find({
          $or: [
            { title: new RegExp(query, "i") },
            { genres: new RegExp(query, "i") },
            { lyrics: new RegExp(query, "i") }
          ]
        }).populate("artist album");

        results.albums = await Album.find({
          $or: [
            { title: new RegExp(query, "i") },
            { genres: new RegExp(query, "i") }
          ]
        }).populate("artist");
      }

      // Recherche phonétique pour les artistes
      if (artist) {
        const artistPhonetic = customMetaphone(artist);
        const allArtists = await Artist.find({});

        results.artists = allArtists.filter((a) => {
          const namePhonetic = customMetaphone(a.name);
          const distance = customLevenshteinDistance(
            artistPhonetic,
            namePhonetic
          );

          return (
            distance <= 2 || a.name.toLowerCase().includes(artist.toLowerCase())
          );
        });
      }

      const additionalFilters = {};
      if (genre) {
        additionalFilters.genres = genre;
      }
      if (mood) {
        additionalFilters.mood = new RegExp(mood, "i");
      }
      if (lyrics) {
        additionalFilters.lyrics = new RegExp(lyrics, "i");
      }

      if (similarTo) {
        const track = await Audio.findById(similarTo);
        if (track) {
          results.tracks = await Audio.find({
            _id: { $ne: track._id },
            genres: { $in: track.genres },
            mood: track.mood,
            tempo: {
              $gte: track.tempo - 10,
              $lte: track.tempo + 10
            }
          }).populate("artist album");
        }
      }

      if (query) {
        const autoCompleteRegex = new RegExp(`^${query}`, "i");
        const autoCompleteArtists = await Artist.find({
          name: autoCompleteRegex
        }).limit(5);
        const autoCompleteTracks = await Audio.find({
          title: autoCompleteRegex
        }).limit(5);

        results.autoComplete.suggestions = [
          ...autoCompleteArtists.map((a) => a.name),
          ...autoCompleteTracks.map((t) => t.title)
        ];
      }

      const finalQuery = {
        $and: [...searchConditions, additionalFilters]
      };

      results.artists = await Artist.find(finalQuery);
      results.albums = await Album.find(finalQuery).populate("artist");
      results.tracks = await Audio.find(finalQuery)
        .populate("artist")
        .populate("album");
      results.playlists = await Playlist.find(finalQuery);

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({
        message: "Une erreur est survenue lors de la recherche.",
        error: error.message
      });
    }
  }
};
