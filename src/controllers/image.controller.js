const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {

  convertImage: async(req, res) => {
    try {
      const { buffer, originalname } = req.file;
      const { format, width, height } = req.body;

      // Vérifier si un fichier est fourni
      if (!buffer) {
        return res.status(400).json({
          message: "No image uploaded"
        });
      }
      // Vérifier si les dimensions sont spécifiées
      if (!width || !height) {
        return res.status(400).json({
          message: "Width and height are required"
        });
      }
      // Créer le répertoire de sortie s'il n'existe pas
      const uploadDir = "uploads/images/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      // Définir le chemin de sortie et le nouveau nom de fichier
      const outputFileName = originalname.replace(/\.[^/.]+$/, `.${format}`);
      const outputFilePath = path.join(uploadDir, outputFileName);

      // Utiliser Sharp pour redimensionner et compresser l'image
      sharp(buffer)
        .resize(parseInt(width), parseInt(height), {
          fit: sharp.fit.inside, // Redimensionne pour être à l'intérieur des dimensions spécifiées
          withoutEnlargement: true // Ne pas agrandir une image plus petite que les dimensions spécifiées
        })
        .toFormat(format, { quality: 80 }) // Compresser l'image avec une qualité de 80%
        .toFile(outputFilePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "An error occurred during image processing",
              error: err.message
            });
          }
          res.status(200).json({
            message: "Image uploaded and processed successfully",
            filePath: outputFilePath
          });
        });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  }
};
