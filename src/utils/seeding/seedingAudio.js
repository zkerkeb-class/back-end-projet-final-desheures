const fs = require("fs");
const path = require("path");
const NodeID3 = require("node-id3");
const { faker } = require("@faker-js/faker");
const getMP3Duration = require("get-mp3-duration");
const sharp = require("sharp");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const Audio = require("../../models/Audio");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const mongoose = require("mongoose");
const config = require("../../config");
const crypto = require("crypto");

// Configuration
const audioDirectory = path.join(__dirname, "../../../uploads/audios/mp3");
const wavDirectory = path.join(__dirname, "../../../uploads/audios/wav");
const imageDirectory = path.join(__dirname, "../../../uploads/images");
const DEFAULT_COVER = "uploads/images/default_cover.jpg";
const DEFAULT_ARTIST_IMAGE = "uploads/images/default_artist.jpg";

// Chemins relatifs
const RELATIVE_WAV_PATH = "uploads/audios/wav";

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
[imageDirectory, wavDirectory].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
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

// Logger setup
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warning: (msg) => console.log(`[WARNING] ${msg}`)
};

// Fonction de conversion MP3 vers WAV
const convertToWav = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .on("error", (err) => {
        logger.error(`Erreur lors de la conversion en WAV: ${err.message}`);
        reject(err);
      })
      .on("end", () => {
        logger.success(`Conversion WAV terminée: ${outputPath}`);
        resolve();
      })
      .save(outputPath);
  });
};

// Fonction pour vérifier si une image existe déjà pour un artiste/album
const getExistingImageUrl = async (name, type) => {
  try {
    if (type === "artist") {
      const artist = await Artist.findOne({ name });
      if (artist?.imageUrl && artist.imageUrl !== DEFAULT_ARTIST_IMAGE) {
        return artist.imageUrl;
      }
    } else if (type === "album") {
      const album = await Album.findOne({ title: name });
      if (album?.coverUrl && album.coverUrl !== DEFAULT_COVER) {
        return album.coverUrl;
      }
    }
    return null;
  } catch (error) {
    logger.error(
      `Erreur lors de la recherche d'image existante pour ${type} ${name}:`,
      error
    );
    return null;
  }
};

const convertAndSaveImage = async (imageBuffer, name, type = "album") => {
  try {
    // Si pas d'image fournie, retourner l'image par défaut
    if (!imageBuffer) {
      return type === "album" ? DEFAULT_COVER : DEFAULT_ARTIST_IMAGE;
    }

    // Vérifier si une image existe déjà
    const existingImageUrl = await getExistingImageUrl(name, type);
    if (existingImageUrl) {
      logger.info(
        `Image existante trouvée pour ${type} ${name}: ${existingImageUrl}`
      );
      return existingImageUrl;
    }

    // Créer un hash unique basé sur le contenu de l'image et le nom
    const imageHash = crypto
      .createHash("md5")
      .update(imageBuffer)
      .update(name)
      .update(type)
      .digest("hex");

    const imageName = `${imageHash}.webp`;
    const imagePath = path.join(imageDirectory, imageName);
    const relativeImagePath = `uploads/images/${imageName}`;

    // Vérifier si le fichier existe déjà sur le disque
    if (fs.existsSync(imagePath)) {
      logger.info(
        `Image existe déjà sur le disque pour ${type} ${name}: ${relativeImagePath}`
      );
      return relativeImagePath;
    }

    // Convertir et sauvegarder la nouvelle image
    await sharp(imageBuffer).webp({ quality: 80 }).toFile(imagePath);
    logger.success(
      `Nouvelle image convertie et sauvegardée pour ${type} ${name}`
    );

    return relativeImagePath;
  } catch (error) {
    logger.error(
      `Erreur lors de la conversion de l'image pour ${type} ${name}:`,
      error
    );
    return type === "album" ? DEFAULT_COVER : DEFAULT_ARTIST_IMAGE;
  }
};
const parseFileName = (fileName) => {
  const parts = fileName.replace(".mp3", "").split(" - ");

  return {
    artistName: parts[0].trim(),
    albumName: parts.length === 3 ? parts[1].trim() : null,
    trackName: parts[parts.length - 1].trim()
  };
};

const createOrUpdateArtist = async (artistName, tags) => {
  let artist = await Artist.findOne({ name: artistName });

  if (!artist) {
    const imageUrl = await convertAndSaveImage(
      tags.image ? tags.image.imageBuffer : null,
      artistName,
      "artist"
    );

    artist = new Artist({
      name: artistName,
      bio: faker.lorem.paragraphs(2),
      popularity: faker.number.int({ min: 0, max: 100 }),
      genres: [],
      albums: [],
      imageUrl
    });
    await artist.save();
    logger.success(`Nouvel artiste créé: ${artistName}`);
  } else if (
    tags.image?.imageBuffer &&
    artist.imageUrl === DEFAULT_ARTIST_IMAGE
  ) {
    // Mettre à jour l'image si c'était l'image par défaut et qu'on a une nouvelle image
    artist.imageUrl = await convertAndSaveImage(
      tags.image.imageBuffer,
      artistName,
      "artist"
    );
    await artist.save();
    logger.info(`Image mise à jour pour l'artiste: ${artistName}`);
  }

  return artist;
};

const createOrUpdateAlbum = async (albumName, artist, tags) => {
  if (!albumName) {
    return null;
  }

  let album = await Album.findOne({
    title: albumName,
    artist: artist._id
  });

  if (!album) {
    const coverUrl = await convertAndSaveImage(
      tags.image ? tags.image.imageBuffer : null,
      albumName,
      "album"
    );

    const albumGenres = tags.genre
      ? [tags.genre]
      : [faker.helpers.arrayElement(GENRES)];

    album = new Album({
      title: albumName,
      artist: artist._id,
      releaseDate: new Date(tags.year || new Date().getFullYear(), 0),
      genres: albumGenres,
      coverUrl,
      popularity: faker.number.int({ min: 0, max: 100 }),
      tracks: []
    });
    await album.save();

    if (!artist.albums.includes(album._id)) {
      artist.albums.push(album._id);
      artist.genres = [...new Set([...artist.genres, ...albumGenres])];
      await artist.save();
      logger.info(`Album ${albumName} ajouté à l'artiste ${artist.name}`);
    }

    logger.success(`Nouvel album créé: ${albumName}`);
  } else if (tags.image?.imageBuffer && album.coverUrl === DEFAULT_COVER) {
    // Mettre à jour l'image si c'était l'image par défaut et qu'on a une nouvelle image
    album.coverUrl = await convertAndSaveImage(
      tags.image.imageBuffer,
      albumName,
      "album"
    );
    await album.save();
    logger.info(`Image mise à jour pour l'album: ${albumName}`);
  }

  return album;
};

const seedAudiosFromFiles = async () => {
  try {
    const files = fs
      .readdirSync(audioDirectory)
      .filter((file) => file.endsWith(".mp3"));
    logger.info(`Début du traitement de ${files.length} fichiers`);

    for (const file of files) {
      const mp3FilePath = path.join(audioDirectory, file);
      const wavFileName = path.basename(file, ".mp3") + ".wav";
      const wavFilePath = path.join(wavDirectory, wavFileName);

      // Convertir en WAV si pas déjà fait
      if (!fs.existsSync(wavFilePath)) {
        try {
          await convertToWav(mp3FilePath, wavFilePath);
        } catch (error) {
          logger.error(`Erreur lors de la conversion de ${file}:`, error);
          continue;
        }
      }

      const tags = NodeID3.read(mp3FilePath);
      const buffer = fs.readFileSync(mp3FilePath);
      const duration = getMP3Duration(buffer) / 1000;

      const { artistName, albumName, trackName } = parseFileName(file);
      const finalArtistName = tags.artist || artistName;
      const finalAlbumName = tags.album || albumName;
      const finalTrackName = tags.title || trackName;

      const artist = await createOrUpdateArtist(finalArtistName, tags);
      const album = await createOrUpdateAlbum(finalAlbumName, artist, tags);

      // Chemin relatif pour le WAV
      const relativeWAVPath = `${RELATIVE_WAV_PATH}/${wavFileName}`;

      let audio = await Audio.findOne({
        title: finalTrackName,
        artist: artist._id,
        ...(album && { album: album._id })
      });

      if (!audio) {
        audio = new Audio({
          title: finalTrackName,
          artist: artist._id,
          album: album ? album._id : null,
          duration,
          audioUrl: relativeWAVPath, // Uniquement l'URL WAV
          genres: album ? album.genres : artist.genres,
          trackNumber: tags.trackNumber,
          popularity: faker.number.int({ min: 0, max: 100 })
        });
        await audio.save();

        if (album && !album.tracks.includes(audio._id)) {
          album.tracks.push(audio._id);
          await album.save();
        }

        logger.success(
          `Audio "${finalTrackName}" ajouté${album ? ` à l'album "${finalAlbumName}"` : ""} de ${finalArtistName}`
        );
      }
    }

    logger.success("Seeding des audios terminé avec succès !");
  } catch (error) {
    logger.error("Erreur lors du seeding:", error);
  } finally {
    mongoose.connection.close();
  }
};

module.exports = seedAudiosFromFiles;
