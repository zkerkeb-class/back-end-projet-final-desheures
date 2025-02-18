const Audio = require("../models/Audio");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const config = require("../config");

module.exports = {
  convertAudio: async (req, res) => {
    try {
      const { buffer, originalname } = req.file;
      const { format } = req.body;

      if (!buffer) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }
      if (!format || format.length === 0) {
        return res.status(400).json({
          message: "Format is required"
        });
      }

      const uploadDir = "uploads/audios/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const outputFileName = originalname.replace(/\.[^/.]+$/, `.${format}`);
      const outputFilePath = path.join(uploadDir, outputFileName);

      tmp.file({ postfix: path.extname(originalname) }, (err, tempFilePath) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to create temporary file",
            error: err.message
          });
        }

        fs.writeFile(tempFilePath, buffer, (err) => {
          if (err) {
            return res.status(500).json({
              message: "Failed to write buffer to temp file",
              error: err.message
            });
          }

          if (!fs.existsSync("uploads")) {
            fs.mkdirSync("uploads", { recursive: true });
          }

          ffmpeg()
            .input(tempFilePath)
            .toFormat(format)
            .output(outputFilePath)
            .on("end", function () {
              res.status(200).json({
                message: "Audio uploaded, converted, and saved successfully",
                filePath: outputFilePath
              });
            })
            .on("error", function (err) {
              res.status(500).json({
                message: "An error occurred during audio processing",
                error: err.message
              });
            })
            .run();
        });
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  },

  createAudio: async (req, res) => {
    try {
      const audio = new Audio(req.body);
      const savedAudio = await monitorMongoQuery('create', 'Audio', () => audio.save().exec());

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

      const audios = await monitorMongoQuery('find', 'Audio', () => {
        Audio.find()
          .populate("artist", "name imageUrl")
          .populate("album", "title coverUrl")
          .exec()
      });


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
      const audio = await monitorMongoQuery('findById', 'Audio', () => {
      Audio.findById(req.params.id)
        .populate("artist", "name imageUrl")
        .populate("album", "title coverUrl")
        .exec()
      });


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
      const updatedAudio = await monitorMongoQuery('update', 'Audio', () => {
      Audio.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )
        .populate("artist", "name")
        .populate("album", "title")
        .exec()
      });

      if (!updatedAudio) {
        return res.status(404).json({ message: "Audio non trouvé" });
      }

      const cacheKey = `audios:${req.params.id}`;
      await config.redis.set(cacheKey, JSON.stringify(updatedAudio), {
        EX: 3600
      });

      await config.redis.flushAll();

      res.status(200).json(updatedAudio);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la mise à jour de l'audio", error });
    }
  },

  deleteAudio: async (req, res) => {
    try {
      const deletedAudio = await monitorMongoQuery('delete', 'Audio', () => Audio.findByIdAndDelete(req.params.id).exec());
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
