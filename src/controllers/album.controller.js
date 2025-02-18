const Album = require("../models/Album");
const config = require("../config");
const { monitorMongoQuery } = require("../utils/metrics/metrics");

module.exports = {
  createAlbum: async (req, res) => {
    try {
      const { tracks = [] } = req.body;
      const trackCount = tracks.length;

      const album = new Album({
        ...req.body,
        trackCount
      });

      const savedAlbum = await monitorMongoQuery("create", "Album", () =>
        album.save()
      );

      await config.redis.del("albums:all");

      res.status(201).json(savedAlbum);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création de l'album", error });
    }
  },

  getAllAlbums: async (req, res) => {
    try {
      const cachedAlbums = await config.redis.get("albums:all");

      if (cachedAlbums) {
        return res.status(200).json(JSON.parse(cachedAlbums));
      }

      const albums = await monitorMongoQuery("find", "Album", () =>
        Album.find().populate("artist").populate("tracks").exec()
      );

      await config.redis.set("albums:all", JSON.stringify(albums), {
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

  getAlbumById: async (req, res) => {
    try {
      const albumId = req.params.id;
      const cacheKey = `albums:${albumId}`;

      const cachedAlbum = await config.redis.get(cacheKey);

      if (cachedAlbum) {
        return res.status(200).json(JSON.parse(cachedAlbum));
      }

      const album = await monitorMongoQuery("findById", "Album", () =>
        Album.findById(albumId).populate("artist").populate("tracks").exec()
      );

      if (!album) {
        return res.status(404).json({ message: "Album non trouvé" });
      }

      await config.redis.set(cacheKey, JSON.stringify(album), {
        EX: 3600
      });

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

      const { tracks } = req.body;

      const updatedAlbum = await monitorMongoQuery("update", "Album", () => {
        return Album.findByIdAndUpdate(
          albumId,
          {
            ...req.body,
            ...(tracks && { trackCount: tracks.length })
          },
          { new: true }
        )
          .populate("artist")
          .populate("tracks")
          .exec();
      });

      if (!updatedAlbum) {
        return res.status(404).json({ message: "Album non trouvé" });
      }

      const cacheKey = `albums:${albumId}`;
      await config.redis.set(cacheKey, JSON.stringify(updatedAlbum), {
        EX: 3600
      });

      await config.redis.flushAll();

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
      const deletedAlbum = await monitorMongoQuery("delete", "Album", () =>
        Album.findByIdAndDelete(albumId).exec()
      );

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
