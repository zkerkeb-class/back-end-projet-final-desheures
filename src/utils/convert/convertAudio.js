const sharp = require("sharp");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const config = require("../../config");

const rootPath = path.join(__dirname, "../../../uploads");
const audioDirectory = path.join(rootPath, "audios");
const imageDirectory = path.join(rootPath, "images");

const directories = {
  mp3: path.join(audioDirectory, "mp3"),
  wav: path.join(audioDirectory, "wav"),
  webp: path.join(imageDirectory, "webp"),
  jpg: path.join(imageDirectory, "jpg")
};

Object.values(directories).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const DEFAULT_IMAGES = {
  ARTIST: {
    webp: "uploads/images/default_artist.webp",
    jpg: "uploads/images/default_artist.webp"
  },
  COVER: {
    webp: "uploads/images/default_cover.webp",
    jpg: "uploads/images/default_cover.webp"
  }
};

const convertToWav = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .toFormat("wav")
      .on("error", (err) => {
        config.logger.error(
          `Erreur lors de la conversion en WAV: ${err.message}`
        );
        reject(err);
      })
      .on("end", () => {
        config.logger.info(`Conversion WAV terminée: ${outputPath}`);
        resolve();
      })
      .save(outputPath);
  });
};

const convertAndSaveImage = async (imageBuffer) => {
  try {
    if (!imageBuffer) {
      return null;
    }

    const imageHash = crypto
      .createHash("md5")
      .update(imageBuffer)
      .digest("hex");

    const webpName = `${imageHash}.webp`;
    const jpgName = `${imageHash}.jpg`;

    const webpPath = path.join(directories.webp, webpName);
    const jpgPath = path.join(directories.jpg, jpgName);

    const relativeWebpPath = `uploads/images/webp/${webpName}`;
    const relativeJpgPath = `uploads/images/jpg/${jpgName}`;

    if (fs.existsSync(webpPath) && fs.existsSync(jpgPath)) {
      return {
        webp: relativeWebpPath,
        jpg: relativeJpgPath
      };
    }

    await Promise.all([
      sharp(imageBuffer).webp({ quality: 80 }).toFile(webpPath),
      sharp(imageBuffer).jpeg({ quality: 85 }).toFile(jpgPath)
    ]);

    return {
      webp: relativeWebpPath,
      jpg: relativeJpgPath
    };
  } catch (error) {
    config.logger.error("❌ Erreur lors de la conversion des images:", error);
    return null;
  }
};

const processAudioFile = async (buffer, originalname) => {
  try {
    const mp3FileName = originalname;
    const mp3Path = path.join(directories.mp3, mp3FileName);
    const wavFileName = mp3FileName.replace(".mp3", ".wav");
    const wavPath = path.join(directories.wav, wavFileName);

    await fs.promises.mkdir(directories.mp3, { recursive: true });
    await fs.promises.mkdir(directories.wav, { recursive: true });
    await fs.promises.writeFile(mp3Path, buffer);

    await convertToWav(mp3Path, wavPath);

    const mp3Exists = await fs.promises
      .access(mp3Path)
      .then(() => true)
      .catch(() => false);
    const wavExists = await fs.promises
      .access(wavPath)
      .then(() => true)
      .catch(() => false);

    if (!mp3Exists || !wavExists) {
      throw new Error("Erreur lors de la création des fichiers audio");
    }

    return {
      mp3Path: `uploads/audios/mp3/${mp3FileName}`,
      wavPath: `uploads/audios/wav/${wavFileName}`,
      absoluteMp3Path: mp3Path,
      absoluteWavPath: wavPath
    };
  } catch (error) {
    config.logger.error("Erreur lors du traitement du fichier audio :", error);
    throw error;
  }
};

module.exports = {
  convertToWav,
  convertAndSaveImage,
  processAudioFile,
  DEFAULT_IMAGES,
  directories
};
