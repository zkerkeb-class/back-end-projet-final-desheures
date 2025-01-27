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

const audioDirectory = path.join(__dirname, "../../../uploads/audios/mp3");
const wavDirectory = path.join(__dirname, "../../../uploads/audios/wav");
const imageDirectory = path.join(__dirname, "../../../uploads/images");
const DEFAULT_COVER = "uploads/images/default_cover.webp";
const DEFAULT_ARTIST_IMAGE = "uploads/images/default_artist.webp";

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
  .then(() => config.logger.info("Connexion à MongoDB réussie !"))
  .catch((err) => {
    config.logger.error("Erreur de connexion à MongoDB:", err);
    process.exit(1);
  });

const convertToWav = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
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
    config.logger.error(
      ` Erreur lors de la recherche d'image existante pour ${type} ${name}:`,
      error
    );
    return null;
  }
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

    const imageName = `${imageHash}.webp`;
    const imagePath = path.join(imageDirectory, imageName);
    const relativeImagePath = `uploads/images/${imageName}`;

    if (fs.existsSync(imagePath)) {
      config.logger.info(
        `Image existe déjà sur le disque: ${relativeImagePath}`
      );
      return relativeImagePath;
    }

    // Convert and save new image
    await sharp(imageBuffer).webp({ quality: 80 }).toFile(imagePath);
    config.logger.info("Nouvelle image convertie et sauvegardée");

    return relativeImagePath;
  } catch (error) {
    config.logger.error("Erreur lors de la conversion de l'image:", error);
    return null;
  }
};

const getImageUrlForEntity = async (imageBuffer, name, type) => {
  try {
    // Check if entity already has an image
    const existingImageUrl = await getExistingImageUrl(name, type);
    if (
      existingImageUrl &&
      existingImageUrl !== DEFAULT_COVER &&
      existingImageUrl !== DEFAULT_ARTIST_IMAGE
    ) {
      return existingImageUrl;
    }

    // Convert and save image if provided, otherwise return default
    const savedImageUrl = await convertAndSaveImage(imageBuffer);
    return (
      savedImageUrl || (type === "album" ? DEFAULT_COVER : DEFAULT_ARTIST_IMAGE)
    );
  } catch (error) {
    config.logger.error(
      ` Erreur lors du traitement de l'image pour ${type} ${name}:`,
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
    const imageUrl = await getImageUrlForEntity(
      tags.image?.imageBuffer,
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
    config.logger.info(`Nouvel artiste créé: ${artistName}`);
  } else if (
    tags.image?.imageBuffer &&
    artist.imageUrl === DEFAULT_ARTIST_IMAGE
  ) {
    artist.imageUrl = await getImageUrlForEntity(
      tags.image?.imageBuffer,
      artistName,
      "artist"
    );
    await artist.save();
    config.logger.info(`Image mise à jour pour l'artiste: ${artistName}`);
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
    const coverUrl = await getImageUrlForEntity(
      tags.image?.imageBuffer,
      albumName,
      "album"
    );
    const releaseYear =
      tags.year ||
      (tags.date ? tags.date.split("-")[0] : new Date().getFullYear());

    const releaseDate = new Date(Number(releaseYear), 0);
    const albumGenres = tags.genre
      ? [tags.genre]
      : [faker.helpers.arrayElement(GENRES)];

    album = new Album({
      title: albumName,
      artist: artist._id,
      releaseDate: releaseDate,
      genres: albumGenres,
      coverUrl,
      popularity: faker.number.int({ min: 0, max: 100 }),
      tracks: [],
      trackCount: 0
    });
    await album.save();

    if (!artist.albums.includes(album._id)) {
      artist.albums.push(album._id);
      artist.genres = [...new Set([...artist.genres, ...albumGenres])];
      await artist.save();
      config.logger.info(
        `Album ${albumName} ajouté à l'artiste ${artist.name}`
      );
    }

    config.logger.info(`Nouvel album créé: ${albumName}`);
  } else {
    // Met à jour l'image si nécessaire
    if (tags.image?.imageBuffer && album.coverUrl === DEFAULT_COVER) {
      album.coverUrl = await getImageUrlForEntity(
        tags.image?.imageBuffer,
        albumName,
        "album"
      );
      config.logger.info(`Image mise à jour pour l'album: ${albumName}`);
    }

    // Synchronise trackCount avec le nombre de pistes
    if (album.tracks.length !== album.trackCount) {
      album.trackCount = album.tracks.length;
      config.logger.info(
        `trackCount mis à jour pour l'album: ${albumName} (${album.trackCount} tracks)`
      );
    }

    await album.save();
  }

  return album;
};

const seedAudiosFromFiles = async () => {
  try {
    const files = fs
      .readdirSync(audioDirectory)
      .filter((file) => file.endsWith(".mp3"));
    config.logger.info(`Début du traitement de ${files.length} fichiers`);

    for (const file of files) {
      const mp3FilePath = path.join(audioDirectory, file);
      const wavFileName = path.basename(file, ".mp3") + ".wav";
      const wavFilePath = path.join(wavDirectory, wavFileName);

      // Convertir en WAV si pas déjà fait
      if (!fs.existsSync(wavFilePath)) {
        try {
          await convertToWav(mp3FilePath, wavFilePath);
        } catch (error) {
          config.logger.error(
            `Erreur lors de la conversion de ${file}:`,
            error
          );
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

      const relativeWAVPath = `${RELATIVE_WAV_PATH}/${wavFileName}`;

      let audio = await Audio.findOne({
        title: finalTrackName,
        artist: artist._id,
        ...(album && { album: album._id })
      });

      if (!audio) {
        const releaseYear =
          tags.year ||
          (tags.date ? tags.date.split("-")[0] : new Date().getFullYear());

        const releaseDate = new Date(Number(releaseYear), 0);
        audio = new Audio({
          title: finalTrackName,
          artist: artist._id,
          album: album ? album._id : null,
          duration,
          audioUrl: relativeWAVPath,
          genres: album ? album.genres : artist.genres,
          popularity: faker.number.int({ min: 0, max: 100 }),
          releaseDate: releaseDate
        });
        await audio.save();

        if (album && !album.tracks.includes(audio._id)) {
          album.tracks.push(audio._id);
          await album.save();
        }

        config.logger.info(
          `Audio "${finalTrackName}" ajouté ${album ? ` "  à l'album "${finalAlbumName}"` : ""} de ${finalArtistName}`
        );
      }
    }

    config.logger.info("Seeding des audios terminé avec succès !");
  } catch (error) {
    config.logger.error("Erreur lors du seeding:", error);
  } finally {
    mongoose.connection.close();
  }
};

module.exports = seedAudiosFromFiles;
