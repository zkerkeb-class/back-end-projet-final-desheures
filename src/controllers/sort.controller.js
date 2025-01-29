const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");
const Playlist = require("../models/Playlist");
const config = require("../config");

module.exports = {
  getAudiosSortedByDuration: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `audios:sorted:duration:${order}`;
      const cachedAudios = await config.redis.get(cacheKey);

      if (cachedAudios) {
        return res.status(200).json(JSON.parse(cachedAudios));
      }

      const audios = await Audio.find().sort({ duration: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(audios), { EX: 3600 });

      res.status(200).json(audios);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des audios", error });
    }
  },

  getAlbumSortedByDate: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `albums:sorted:date:${order}`;
      const cachedAlbums = await config.redis.get(cacheKey);

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      const albums = await Album.find().sort({ releaseDate: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(albums), { EX: 3600 });

      res.status(200).json(albums);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des albums", error });
    }
  },

  getArtistsSortedByAlphabet: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `artists:sorted:alphabet:${order}`;
      const cachedArtists = await config.redis.get(cacheKey);

      if (cachedArtists) {
        return res.status(200).json(JSON.parse(cachedArtists));
      }

      const artists = await Artist.find().sort({ name: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(artists), { EX: 3600 });

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
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `playlists:sorted:audios:${order}`;
      const cachedPlaylists = await config.redis.get(cacheKey);

      if (cachedPlaylists) {
        return res.status(200).json(JSON.parse(cachedPlaylists));
      }

      const playlists = await Playlist.find().sort({ trackCount: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(playlists), { EX: 3600 });

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
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `audios:sorted:popularity:${order}`;
      const cachedAudios = await config.redis.get(cacheKey);

      if (cachedAudios) {
        return res.status(200).json(JSON.parse(cachedAudios));
      }

      const audios = await Audio.find().sort({ popularity: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(audios), { EX: 3600 });

      res.status(200).json(audios);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des audios", error });
    }
  },

  getAlbumsSortedByPopularity: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `albums:sorted:popularity:${order}`;
      const cachedAlbums = await config.redis.get(cacheKey);

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      const albums = await Album.find().sort({ popularity: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(albums), { EX: 3600 });

      res.status(200).json(albums);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des albums", error });
    }
  },

  getArtistsSortedByPopularity: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `artists:sorted:popularity:${order}`;
      const cachedArtists = await config.redis.get(cacheKey);

      if (cachedArtists) {
        return res.status(200).json(JSON.parse(cachedArtists));
      }

      const artists = await Artist.find().sort({ popularity: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(artists), { EX: 3600 });

      res.status(200).json(artists);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des artists", error });
    }
  },

  getAlbumsSortedByNumberOfTracks: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `albums:sorted:tracks:${order}`;
      const cachedAlbums = await config.redis.get(cacheKey);

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      const albums = await Album.find().sort({ trackCount: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(albums), { EX: 3600 });

      res.status(200).json(albums);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des albums", error });
    }
  },

  getTracksSortedByAlphabetOfTheTitle: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `tracks:sorted:title:${order}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }

      const tracks = await Audio.find().sort({ title: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(tracks), { EX: 3600 });

      res.status(200).json(tracks);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des piste", error });
    }
  },

  getAlbumsSortedByReleaseDate: async (req, res) => {
    try {
      const { order = "asc" } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;

      const cacheKey = `albums:sorted:releaseDate:${order}`;
      const cachedAlbums = await config.redis.get(cacheKey);

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      const albums = await Album.find().sort({ releaseDate: sortOrder });
      await config.redis.set(cacheKey, JSON.stringify(albums), { EX: 3600 });

      res.status(200).json(albums);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des albums", error });
    }
  }
};
