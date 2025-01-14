const Audio = require("../models/Audio");
const config = require("../config");
module.exports = {
  createAudio: async (req, res) => {
    try {
      const audio = new Audio(req.body);
      const savedAudio = await audio.save();

      await config.redis.del("audios:all");
      res.status(201).json(savedAudio);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création de l'audio", error });
    }
  },

  getAllAudios: async (req, res) => {
    try {
      const cachedAudios = await config.redis.get("audios:all");

      if (cachedAudios) {
        return res.status(200).json(JSON.parse(cachedAudios));
      }

      const audios = await Audio.find()
        .populate("artist", "name")
        .populate("album", "title");

      await config.redis.set("audios:all", JSON.stringify(audios), {
        EX: 3600
      });

      res.status(200).json(audios);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des audios",
        error
      });
    }
  },

  getAudioById: async (req, res) => {
    try {
      const audio = await Audio.findById(req.params.id)
        .populate("artist", "name")
        .populate("album", "title");

      const cacheKey = `audios:${req.params.id}`;
      const cachedAudio = await config.redis.get(cacheKey);

      if (cachedAudio) {
        return res.status(200).json(JSON.parse(cachedAudio));
      }

      if (!audio) {
        return res.status(404).json({ message: "Audio non trouvé" });
      }

      await config.redis.set(cacheKey, JSON.stringify(audio), {
        EX: 3600
      });

      res.status(200).json(audio);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération de l'audio",
        error
      });
    }
  },

  updateAudio: async (req, res) => {
    try {
      const updatedAudio = await Audio.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )
        .populate("artist", "name")
        .populate("album", "title");
      if (!updatedAudio) {
        return res.status(404).json({ message: "Audio non trouvé" });
      }

      const cacheKey = `audios:${req.params.id}`;
      await config.redis.set(cacheKey, JSON.stringify(updatedAudio), {
        EX: 3600
      });

      await config.redis.del("audios:all");

      res.status(200).json(updatedAudio);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la mise à jour de l'audio", error });
    }
  },

  deleteAudio: async (req, res) => {
    try {
      const deletedAudio = await Audio.findByIdAndDelete(req.params.id);
      if (!deletedAudio) {
        return res.status(404).json({ message: "Audio non trouvé" });
      }
      const cacheKey = `audios:${req.params.id}`;
      await config.redis.del(cacheKey);

      await config.redis.del("audios:all");
      res.status(200).json({
        message: "Audio supprimé avec succès",
        audio: deletedAudio
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'audio", error });
    }
  }
};
