const Album = require("../models/Album");
const config = require("../config");

module.exports = {
  createAlbum: async (req, res) => {
    try {
      const album = new Album(req.body);
      const savedAlbum = await album.save();

      const startSet = performance.now();
      await config.redis.del("albums:all");
      const endSet = performance.now();
      const setLatency = (endSet - startSet).toFixed(2);

      req.redisMetrics.operations.push({ operation: "DEL", latency: `${setLatency} ms` });



      res.status(201).json(savedAlbum);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création de l'album", error });
    }
  },

  getAllAlbums: async (req, res) => {
    try {

      // Mesurer une opération GET
      const startGet = performance.now();
      const cachedAlbums = await config.redis.get("albums:all");
      const endGet = performance.now();
      const getLatency = (endGet - startGet).toFixed(2);

      // Ajouter la latence GET dans les metrics
      req.redisMetrics.operations.push({ operation: "GET", latency: `${getLatency} ms` });

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      const albums = await Album.find().populate("artist").populate("tracks");

      // Mesurer l'opération SET
      const startSet = performance.now();
      await config.redis.set("albums:all", JSON.stringify(albums), {
        EX: 3600
      });
      const endSet = performance.now();
      const setLatency = (endSet - startSet).toFixed(2);

      req.redisMetrics.operations.push({ operation: "SET", latency: `${setLatency} ms` });

      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des albums",
        error
      });
    }
  },

  getAlbumById: async (req, res) => {
    try {
      const albumId = req.params.id;
      const cacheKey = `albums:${albumId}`;

      // Mesurer une opération GET
      const startGet = performance.now();
      const cachedAlbum = await config.redis.get(cacheKey);
      const endGet = performance.now();
      const getLatency = (endGet - startGet).toFixed(2);

      // Ajouter la latence GET dans les metrics
      req.redisMetrics.operations.push({ operation: "GET", latency: `${getLatency} ms` });

      if (cachedAlbum) {
        return res.status(200).json(JSON.parse(cachedAlbum));
      }

      const album = await Album.findById(albumId)
        .populate("artist")
        .populate("tracks");

      if (!album) {
        return res.status(404).json({ message: "Album non trouvé" });
      }

      // Mesurer l'opération SET
      const startSet = performance.now();
      req.redisMetrics.operations.push({ operation: "SET", latency: `${setLatency} ms` });
      await config.redis.set(cacheKey, JSON.stringify(album), {
        EX: 3600
      });
      const endSet = performance.now();
      const setLatency = (endSet - startSet).toFixed(2);


      res.status(200).json(album);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération de l'album",
        error
      });
    }
  },

  updateAlbum: async (req, res) => {
    try {
      const albumId = req.params.id;
      const updatedAlbum = await Album.findByIdAndUpdate(albumId, req.body, {
        new: true
      })
        .populate("artist")
        .populate("tracks");

      if (!updatedAlbum) {
        return res.status(404).json({ message: "Album non trouvé" });
      }

      const cacheKey = `albums:${albumId}`;
      // Mesurer l'opération SET
      const startSet = performance.now();
      await config.redis.set(cacheKey, JSON.stringify(updatedAlbum), { EX: 3600 });
      await config.redis.del("albums:all");
      const endSet = performance.now();
      const setLatency = (endSet - startSet).toFixed(2);

      req.redisMetrics.operations.push({ operation: "SET", latency: `${setLatency} ms` });

      res.status(200).json(updatedAlbum);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la mise à jour de l'album", error });
    }
  },

  deleteAlbum: async (req, res) => {
    try {
      const albumId = req.params.id;
      const deletedAlbum = await Album.findByIdAndDelete(albumId);

      if (!deletedAlbum) {
        return res.status(404).json({ message: "Album non trouvé" });
      }

      const cacheKey = `albums:${albumId}`;
      await config.redis.del(cacheKey);

      await config.redis.del("albums:all");

      res.status(200).json({
        message: "Album supprimé avec succès",
        album: deletedAlbum
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'album", error });
    }
  }
};
