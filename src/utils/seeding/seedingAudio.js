const fs = require("fs");
const path = require("path");
const NodeID3 = require("node-id3");
const { faker } = require("@faker-js/faker");
const getMP3Duration = require("get-mp3-duration");
const sharp = require("sharp");
const Audio = require("../../models/Audio");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const mongoose = require("mongoose");
const config = require("../../config");
const crypto = require("crypto");

// Configuration
const audioDirectory = path.join(__dirname, "../../../uploads/audios/mp3");
const imageDirectory = path.join(__dirname, "../../../uploads/images");
const DEFAULT_COVER = "uploads/images/default_cover.jpg";

const GENRES = [
  "Rock",
  "Pop",
  "Hip Hop",
  "Jazz",
  "Classical",
  "Electronic",
  "R&B",
  "Country",
  "Metal",
  "Folk"
];

// Création des dossiers nécessaires
if (!fs.existsSync(imageDirectory)) {
  fs.mkdirSync(imageDirectory, { recursive: true });
}

// Logger setup
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warning: (msg) => console.log(`[WARNING] ${msg}`)
};

// Connexion MongoDB
mongoose
  .connect(config.env.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => logger.success("Connexion à MongoDB réussie !"))
  .catch((err) => {
    logger.error("Erreur de connexion à MongoDB:", err);
    process.exit(1);
  });

// Fonction pour convertir et sauvegarder une image en .webp
const convertAndSaveImage = async (tags, artistName, albumName) => {
  try {
    if (tags.image && tags.image.imageBuffer) {
      const imageHash = crypto
        .createHash("md5")
        .update(`${artistName}-${albumName}`)
        .digest("hex");

      const imageName = `${imageHash}.webp`;
      const imagePath = path.join(imageDirectory, imageName);
      const relativeImagePath = `uploads/images/${imageName}`;

      if (!fs.existsSync(imagePath)) {
        await sharp(tags.image.imageBuffer)
          .webp({ quality: 80 })
          .toFile(imagePath);
        logger.success(
          `Image convertie et sauvegardée pour ${artistName} - ${albumName}: ${imagePath}`
        );
      } else {
        logger.info(
          `Image existe déjà pour ${artistName} - ${albumName}: ${imagePath}`
        );
      }

      return relativeImagePath;
    }
    return DEFAULT_COVER;
  } catch (error) {
    logger.error("Erreur lors de la conversion de l'image:", error);
    return DEFAULT_COVER;
  }
};

// Fonction principale de seeding
const seedAudiosFromFiles = async () => {
  try {
    const files = fs
      .readdirSync(audioDirectory)
      .filter((file) => file.endsWith(".mp3"));
    logger.info(`Début du traitement de ${files.length} fichiers`);

    for (const file of files) {
      const filePath = path.join(audioDirectory, file);
      const tags = NodeID3.read(filePath);
      const buffer = fs.readFileSync(filePath);
      const duration = getMP3Duration(buffer) / 1000;

      const artistName =
        tags.artist ||
        path.parse(file).name.split(" - ")[0] ||
        "Unknown Artist";
      const albumName = tags.album || "Unknown Album";
      const trackName = tags.title || path.parse(file).name;

      // Créer ou récupérer l'artiste
      let artist = await Artist.findOne({ name: artistName });
      if (!artist) {
        artist = new Artist({
          name: artistName,
          bio: faker.lorem.paragraphs(2),
          popularity: faker.number.int({ min: 0, max: 100 }),
          genres: []
        });
        await artist.save();
        logger.success(`Nouvel artiste créé: ${artistName}`);
      }

      // Créer ou récupérer l'album
      let album = await Album.findOne({
        title: albumName,
        artist: artist._id
      });

      if (!album) {
        const coverUrl = await convertAndSaveImage(tags, artistName, albumName);
        album = new Album({
          title: albumName,
          artist: artist._id,
          releaseDate: new Date(tags.year || new Date().getFullYear(), 0),
          genres: tags.genre
            ? [tags.genre]
            : [faker.helpers.arrayElement(GENRES)],
          coverUrl,
          popularity: faker.number.int({ min: 0, max: 100 }),
          tracks: []
        });
        await album.save();
        logger.success(`Nouvel album créé: ${albumName} pour ${artistName}`);
      }

      // Mettre à jour les genres de l'artiste
      artist.genres = [...new Set([...artist.genres, ...album.genres])];
      await artist.save();

      // Créer ou récupérer la piste audio
      let audio = await Audio.findOne({
        title: trackName,
        album: album._id,
        artist: artist._id
      });

      if (!audio) {
        audio = new Audio({
          title: trackName,
          album: album._id,
          artist: artist._id,
          duration,
          audioUrl: filePath,
          genres: album.genres,
          trackNumber: tags.trackNumber,
          popularity: faker.number.int({ min: 0, max: 100 })
        });
        await audio.save();

        if (!album.tracks.includes(audio._id)) {
          album.tracks.push(audio._id);
          await album.save();
        }

        logger.success(
          `Audio "${trackName}" ajouté à l'album "${albumName}" de ${artistName}`
        );
      }
    }

    logger.success("Seeding des audios terminé avec succès !");
  } catch (error) {
    logger.error("Erreur lors du seeding:", error);
  }
};

module.exports = seedAudiosFromFiles;
