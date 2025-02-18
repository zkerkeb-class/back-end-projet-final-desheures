const config = require("../config");
const Artist = require("../models/Artist");
const { monitorMongoQuery } = require("../utils/metrics/metrics");

module.exports = {
  createArtist: async (req, res) => {
    try {
      const artist = new Artist(req.body);
      const savedArtist = await monitorMongoQuery('create', 'Artist', () => artist.save().exec());

      await config.redis.del("artists:all");
      res.status(201).json(savedArtist);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la création", error });
    }
  },
  getAllArtists: async (req, res) => {
    try {
      const cachedArtists = await config.redis.get("artists:all");
      if (cachedArtists) {
        return res.status(200).json(JSON.parse(cachedArtists));
      }

      const artists = await monitorMongoQuery('find', 'Artist', () => Artist.find().exec());

      await config.redis.set("artists:all", JSON.stringify(artists), {
        EX: 3600
      });

      res.status(200).json(artists);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des artistes",
        error
      });
    }
  },
  getArtistById: async (req, res) => {
    try {
      const artist = await monitorMongoQuery('findById', 'Artist', () => Artist.findById(req.params.id).exec());
      const cacheKey = `artists:${req.params.id}`;

      const cachedArtists = await config.redis.get(cacheKey);
      if (cachedArtists) {
        return res.status(200).json(JSON.parse(cachedArtists));
      }

      if (!artist) {
        return res.status(404).json({ message: "Artiste non trouvé" });
      }

      await config.redis.set(cacheKey, JSON.stringify(artist), {
        EX: 3600
      });

      res.status(200).json(artist);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération",
        error
      });
    }
  },
  updateArtist: async (req, res) => {
    try {
      const updatedArtist = await monitorMongoQuery('update', 'Artist', () => {
        Artist.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        ).exec()
      });
      if (!updatedArtist) {
        return res.status(404).json({ message: "Artiste non trouvé" });
      }

      const cacheKey = `artists:${req.params.id}`;
      await config.redis.set(cacheKey, JSON.stringify(updatedArtist), {
        EX: 3600
      });
      await config.redis.flushAll();
      res.status(200).json(updatedArtist);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  },
  deleteArtist: async (req, res) => {
    try {
      const deletedArtist = await monitorMongoQuery('delete', 'Artist', () => Artist.findByIdAndDelete(req.params.id).exec());
      if (!deletedArtist) {
        return res.status(404).json({ message: "Artiste non trouvé" });
      }
      const cacheKey = `artists:${req.params.id}`;
      await config.redis.del(cacheKey);

      await config.redis.del("artists:all");

      res.status(200).json({
        message: "Artiste supprimé avec succès",
        artist: deletedArtist
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
  }
};
