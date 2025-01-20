const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");
const Playlist = require("../models/Playlist");

const levenshtein = require("fast-levenshtein"); // Package pour la distance de Levenshtein

module.exports = {
  search: async (req, res) => {
    try {
      // Importer `metaphone` dynamiquement pour les projets CommonJS
      const { default: metaphone } = await import("metaphone");

      const { query, artist, album, genre, mood, lyrics, similarTo } =
        req.query;

      const results = {
        artists: [],
        albums: [],
        tracks: [],
        playlists: []
      };

      if (query) {
        const regexQuery = new RegExp(query, "i");
        results.artists = await Artist.find({ name: regexQuery });
        results.albums = await Album.find({ title: regexQuery }).populate(
          "artist"
        );
        results.tracks = await Audio.find({
          $or: [{ title: regexQuery }, { lyrics: regexQuery }]
        }).populate("artist album");
        results.playlists = await Playlist.find({ name: regexQuery });
      }

      if (artist) {
        const artistPhonetic = metaphone(artist);
        const allArtists = await Artist.find({});
        results.artists = allArtists.filter((a) => {
          const namePhonetic = metaphone(a.name);
          const distance = levenshtein.get(artistPhonetic, namePhonetic);
          return distance <= 2;
        });
      }

      if (album) {
        const regexAlbum = new RegExp(album, "i");
        results.albums = await Album.find({ title: regexAlbum }).populate(
          "artist"
        );
      }

      if (genre) {
        results.artists = await Artist.find({ genres: genre });
        results.albums = await Album.find({ genres: genre }).populate("artist");
        results.tracks = await Audio.find({ genres: genre }).populate(
          "artist album"
        );
      }

      if (mood) {
        const regexMood = new RegExp(mood, "i");
        results.tracks = await Audio.find({ mood: regexMood }).populate(
          "artist album"
        );
      }

      if (lyrics) {
        const regexLyrics = new RegExp(lyrics, "i");
        results.tracks = await Audio.find({
          lyrics: regexLyrics
        }).populate("artist album");
      }

      if (similarTo) {
        const track = await Audio.findById(similarTo);
        if (track) {
          results.tracks = await Audio.find({
            _id: { $ne: track._id },
            genres: { $in: track.genres },
            mood: track.mood,
            tempo: { $gte: track.tempo - 10, $lte: track.tempo + 10 }
          }).populate("artist album");
        }
      }

      if (query) {
        const autoCompleteRegex = new RegExp(`^${query}`, "i");
        const autoCompleteArtists = await Artist.find({
          name: autoCompleteRegex
        });
        const autoCompleteTracks = await Audio.find({
          title: autoCompleteRegex
        });
        results.autoComplete = {
          artists: autoCompleteArtists,
          tracks: autoCompleteTracks
        };
      }

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({
        message: "Une erreur est survenue lors de la recherche.",
        error
      });
    }
  }
};
