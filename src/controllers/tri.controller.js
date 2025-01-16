const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");
const Playlist = require("../models/Playlist");
const config = require("../config");

module.exports = {
  getAudiosSortedByDurationAsc: async (req, res) => {
    try {
      const cachedAudios = await config.redis.get("audios:sorted:duration:asc");
      if (cachedAudios) {
        return res.status(200).json(JSON.parse(cachedAudios));
      }
      const audios = await Audio.find().sort({ duration: 1 });
      await config.redis.set(
        "audios:sorted:duration:asc",
        JSON.stringify(audios),
        { EX: 3600 }
      );
      res.status(200).json(audios);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des audios", error });
    }
  },
  getAudiosSortedByDurationDesc: async (req, res) => {
    try {
      const cachedAudios = await config.redis.get(
        "audios:sorted:duration:desc"
      );
      if (cachedAudios) {
        return res.status(200).json(JSON.parse(cachedAudios));
      }
      const audios = await Audio.find().sort({ duration: -1 });
      await config.redis.set(
        "audios:sorted:duration:desc",
        JSON.stringify(audios),
        { EX: 3600 }
      );
      res.status(200).json(audios);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des audios", error });
    }
  },

  getAlbumSortedByDate: async (req, res) => {
    try {
      const cachedAlbums = await config.redis.get("albums:sorted:date");
      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }
      const albums = await Album.find().sort({ releaseDate: 1 });
      await config.redis.set("albums:sorted:date", JSON.stringify(albums), {
        EX: 3600
      });
      res.status(200).json(albums);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des albums", error });
    }
  },
  getArtistsSortedByAlphabet: async (req, res) => {
    try {
      const cachedArtists = await config.redis.get("artists:sorted:alphabet");
      if (cachedArtists) {
        return res.status(200).json(JSON.parse(cachedArtists));
      }
      const artists = await Artist.find().sort({ name: 1 });
      await config.redis.set(
        "artists:sorted:alphabet",
        JSON.stringify(artists),
        {
          EX: 3600
        }
      );
      res.status(200).json(artists);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des artistes",
        error
      });
    }
  },
  getPlaylistBySortedByNumberOfTracks: async (req, res) => {
    try {
      const cachedPlaylists = await config.redis.get("playlists:sorted:audios");
      if (cachedPlaylists) {
        return res.status(200).json(JSON.parse(cachedPlaylists));
      }
      const playlists = await Playlist.find().sort({ trackCount: -1 });
      await config.redis.set(
        "playlists:sorted:audios",
        JSON.stringify(playlists),
        { EX: 3600 }
      );
      res.status(200).json(playlists);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des playlists",
        error
      });
    }
  },
  getAudiosSortedByPopularity: async (req, res) => {
    try {
      const cachedAudios = await config.redis.get("audios:sorted:popularity");
      if (cachedAudios) {
        return res.status(200).json(JSON.parse(cachedAudios));
      }
      const audios = await Audio.find().sort({ popularity: -1 });
      await config.redis.set(
        "audios:sorted:popularity",
        JSON.stringify(audios),
        { EX: 3600 }
      );
      res.status(200).json(audios);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des audios", error });
    }
  },
  getAlbumsSortedByNumberOfTracks: async (req, res) => {
    try {
      const cachedAlbums = await config.redis.get("albums:sorted:tracks");
      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }
      const albums = await Album.find().sort({ trackCount: -1 });
      await config.redis.set("albums:sorted:tracks", JSON.stringify(albums), {
        EX: 3600
      });
      res.status(200).json(albums);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des albums", error });
    }
  },
  getTracksSortedByAlphabetOfTheTitle: async (req, res) => {
    try {
      const cachedTracks = await config.redis.get("tracks:sorted:title");
      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }
      const tracks = await Audio.find().sort({ title: 1 });
      await config.redis.set("tracks:sorted:title", JSON.stringify(tracks), {
        EX: 3600
      });
      res.status(200).json(tracks);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des piste", error });
    }
  }
};
