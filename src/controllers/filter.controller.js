const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");
const Playlist = require("../models/Playlist");
const config = require("../config");
const { monitorMongoQuery } = require("../utils/metrics/metrics");
module.exports = {
  getAllGenres: async (req, res) => {
    try {
      const albumGenres = await monitorMongoQuery('distinctAlbumByGenre', 'Album', () => Album.distinct("genres").exec());
      const audioGenres = await monitorMongoQuery('distinctAudioByGenre', 'Audio', () => Audio.distinct("genres").exec());
      const artistGenres = await monitorMongoQuery('distinctArtisteByGenre', 'Artiste', () => Artist.distinct("genres").exec());

      const allGenres = Array.from(
        new Set([...albumGenres, ...audioGenres, ...artistGenres])
      );

      res.status(200).json(allGenres);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des genres",
        error
      });
    }
  },
  getAlbumsByArtist: async (req, res) => {
    try {
      const { artistId } = req.params;
      const albums = await monitorMongoQuery('findAlbumByArtiste', 'Album', () => Album.find({ artist: artistId }).exec());
      const cacheKey = `albums:artist:${artistId}`;

      const cachedAlbums = await config.redis.get(cacheKey);

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      if (albums.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun album trouvé pour cet artiste" });
      }

      await config.redis.set(cacheKey, JSON.stringify(albums), {
        EX: 3600
      });

      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des albums",
        error
      });
    }
  },

  getTracksByArtist: async (req, res) => {
    try {
      const { artistId } = req.params;

      const cacheKey = `tracks:artist:${artistId}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }
      const tracks = await monitorMongoQuery('findAudioByArtiste', 'Audio', () => Audio.find({ artist: artistId }).exec());

      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cet artiste" });
      }

      await config.redis.set(cacheKey, JSON.stringify(tracks), {
        EX: 3600
      });

      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio",
        error
      });
    }
  },

  getTracksByAlbum: async (req, res) => {
    try {
      const { albumId } = req.params;

      const cacheKey = `tracks:album:${albumId}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }

      const tracks = await monitorMongoQuery('findTracksByAlbum', 'Audio', () => Audio.find({ album: albumId }).exec());
      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cet album" });
      }

      await config.redis.set(cacheKey, JSON.stringify(tracks), {
        EX: 3600
      });

      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio par album",
        error
      });
    }
  },

  getArtistsByGenre: async (req, res) => {
    try {
      const { genre } = req.params;
      const artists = await monitorMongoQuery('findArtisteByGenre', 'Artiste', () => Artist.find({ genres: genre }).exec());
      const cacheKey = `artists:genre:${genre}`;
      const cachedArtists = await config.redis.get(cacheKey);

      if (cachedArtists) {
        return res.status(200).json(JSON.parse(cachedArtists));
      }
      if (artists.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun artiste trouvé pour ce genre" });
      }

      await config.redis.set(cacheKey, JSON.stringify(artists), {
        EX: 3600
      });

      res.status(200).json(artists);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des artistes par genre",
        error
      });
    }
  },

  getAlbumsByGenre: async (req, res) => {
    try {
      const { genre } = req.params;
      const albums = await monitorMongoQuery('findAlbumByGenre', 'Album', () => Album.find({ genres: genre }).exec());
      const cacheKey = `albums:genre:${genre}`;
      const cachedAlbums = await config.redis.get(cacheKey);

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }
      if (albums.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun album trouvé pour ce genre" });
      }

      await config.redis.set(cacheKey, JSON.stringify(albums), {
        EX: 3600
      });

      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des albums par genre",
        error
      });
    }
  },

  getTracksByGenre: async (req, res) => {
    try {
      const { genre } = req.params;
      const tracks = await monitorMongoQuery('findAudioByGenre', 'Audio', () => Audio.find({ genres: genre }).exec());
      const cacheKey = `tracks:genre:${genre}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }

      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour ce genre" });
      }

      await config.redis.set(cacheKey, JSON.stringify(tracks), {
        EX: 3600
      });

      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio par genre",
        error
      });
    }
  },

  getAlbumsByYear: async (req, res) => {
    try {
      const { year } = req.params;
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const cacheKey = `albums:year:${year}`;
      const cachedAlbums = await config.redis.get(cacheKey);

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      const albums = await monitorMongoQuery('findByYear', 'Album', () => {
      Album.find({
        releaseDate: { $gte: startOfYear, $lte: endOfYear }
      }).exec()
    });

      if (albums.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun album trouvé pour cette année" });
      }

      await config.redis.set(cacheKey, JSON.stringify(albums), {
        EX: 3600
      });

      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des albums par année",
        error
      });
    }
  },

  getTracksByYear: async (req, res) => {
    try {
      const { year } = req.params;
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const cacheKey = `tracks:year:${year}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }
      const tracks = await monitorMongoQuery('findAudioByYear', 'Audio', () => {
      Audio.find({
        releaseDate: { $gte: startOfYear, $lte: endOfYear }
      }).exec()
    });

      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cette année" });
      }

      await config.redis.set(cacheKey, JSON.stringify(tracks), {
        EX: 3600
      });
      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio par année",
        error
      });
    }
  },
  getTracksByDuration: async (req, res) => {
    try {
      const { range } = req.params;

      const cacheKey = `tracks:duration:${range}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }

      let durationFilter = {};
      if (range === "short") {
        durationFilter = { duration: { $lt: 180 } };
      } else if (range === "medium") {
        durationFilter = { duration: { $gte: 180, $lte: 300 } };
      } else if (range === "long") {
        durationFilter = { duration: { $gt: 300 } };
      } else {
        return res.status(400).json({ message: "Plage de durée invalide" });
      }

      const tracks = await monitorMongoQuery('findAudioByDuration', 'Audio', () => Audio.find(durationFilter).exec());

      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cette plage de durée" });
      }

      await config.redis.set(cacheKey, JSON.stringify(tracks), {
        EX: 3600
      });

      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes par durée",
        error
      });
    }
  },
  getTracksByPopularity: async (req, res) => {
    try {
      const { minPopularity, maxPopularity } = req.query;

      const cacheKey = `tracks:popularity:${minPopularity}-${maxPopularity}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }
      const popularityFilter = {
        popularity: {
          $gte: minPopularity || 0,
          $lte: maxPopularity || 100
        }
      };

      const tracks = await monitorMongoQuery('findAudioByPopularity', 'Audio', () => Audio.find(popularityFilter).exec());
      if (tracks.length === 0) {
        return res.status(404).json({
          message: "Aucune piste trouvée pour cette plage de popularité"
        });
      }

      await config.redis.set(cacheKey, JSON.stringify(tracks), {
        EX: 3600
      });
      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes par popularité",
        error
      });
    }
  },

  getTracksByPlaylist: async (req, res) => {
    try {
      const { playlistId } = req.params;

      const cacheKey = `tracks:playlist:${playlistId}`;
      const cachedTracks = await config.redis.get(cacheKey);

      if (cachedTracks) {
        return res.status(200).json(JSON.parse(cachedTracks));
      }
      const playlist = await monitorMongoQuery('findPlaylistById', 'Playlist', () => Playlist.findById(playlistId).populate("tracks").exec());

      if (!playlist) {
        return res.status(404).json({ message: "Playlist introuvable" });
      }

      await config.redis.set(cacheKey, JSON.stringify(playlist.tracks), {
        EX: 3600
      });
      res.status(200).json(playlist.tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes par playlist",
        error
      });
    }
  }
};
