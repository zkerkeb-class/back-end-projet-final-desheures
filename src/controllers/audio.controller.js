const Audio = require("../models/Audio");

module.exports = {
  createAudio: async (req, res) => {
    try {
      const audio = new Audio(req.body);
      const savedAudio = await audio.save();
      res.status(201).json(savedAudio);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création de l'audio", error });
    }
  },

  getAllAudios: async (req, res) => {
    try {
      const audios = await Audio.find()
        .populate("artist", "name")
        .populate("album", "title");
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
      if (!audio) {
        return res.status(404).json({ message: "Audio non trouvé" });
      }
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
