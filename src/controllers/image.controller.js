const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  convertImage: async (req, res) => {
    try {
      const { buffer, originalname } = req.file;
      const { format, width, height } = req.body;

      if (!buffer) {
        return res.status(400).json({
          message: "No image uploaded"
        });
      }

      if (!width || !height) {
        return res.status(400).json({
          message: "Width and height are required"
        });
      }

      const uploadDir = "uploads/images/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const outputFileName = originalname.replace(/\.[^/.]+$/, `.${format}`);
      const outputFilePath = path.join(uploadDir, outputFileName);

      sharp(buffer)
        .resize(parseInt(width), parseInt(height), {
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFormat(format, { quality: 80 })
        .toFile(outputFilePath, (err) => {
          if (err) {
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
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }
};
