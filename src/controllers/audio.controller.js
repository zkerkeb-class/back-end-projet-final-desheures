const Audio = require("../models/Audio");
const fs = require("fs");
const path = require("path");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);



module.exports = {

  convertAudio: async(req, res) => {
    try {
      // Accéder aux données du fichier et du format
      const { format } = req.body; // Le format est dans req.body
      const file = req.file;
      console.log("file : ",file);
      // console.log("format : ",format);
      // console.log("req.bod : ",req);


      // Vérifier que le fichier a été téléchargé
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      // Vérifier que le format est spécifié
      if (!format || format.length === 0) {
        return res.status(400).json({ message: "Formats are required and must be an array" });
      }

      const outputDir = path.join(__dirname, "../../uploads/audios");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir); // Crée le répertoire de sortie s'il n'existe pas
      }
      // Ici, ajoutez le code pour traiter la conversion du fichier, par exemple :
      // const outputPath = path.join(outputDir, `${path.parse(fileName).name}.${format}`);

      // ffmpeg(inputPath)
      //   .toFormat(format)
      //   .on("end", () => {
      //     if (!res.headersSent) {
      //       res.status(200).json({
      //         message: `File successfully converted to ${format}`,
      //         outputPath
      //       });
      //     }
      //   })
      //   .on("error", (err) => {
      //     console.error(err);
      //     if (!res.headersSent) {
      //       res.status(500).json({
      //         message: "An error occurred during conversion",
      //         error: err.message
      //       });
      //     }
      //   })
      //   .save(outputPath);



      res.json(file);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  },

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
