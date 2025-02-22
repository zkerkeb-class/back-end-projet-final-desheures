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
const jpgDirectory = path.join(imageDirectory, "jpg");
const webpDirectory = path.join(imageDirectory, "webp");

const RELATIVE_MP3_PATH = "uploads/audios/mp3";
const RELATIVE_WAV_PATH = "uploads/audios/wav";

const DEFAULT_COVER = {
  webp: "uploads/images/default_cover.webp",
  jpg: "uploads/images/default_cover.jpg"
};

const DEFAULT_ARTIST_IMAGE = {
  webp: "uploads/images/default_artist.webp",
  jpg: "uploads/images/default_artist.jpg"
};

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

[jpgDirectory, webpDirectory, wavDirectory].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    config.logger.info(`Création du dossier: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

mongoose
  .connect(config.env.mongo_uri, {
    dbName: "desheures"
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

    const webpPath = path.join(webpDirectory, webpName);
    const jpgPath = path.join(jpgDirectory, jpgName);

    const relativeWebpPath = `uploads/images/webp/${webpName}`;
    const relativeJpgPath = `uploads/images/jpg/${jpgName}`;

    if (fs.existsSync(webpPath) && fs.existsSync(jpgPath)) {
      config.logger.info("Images déjà existantes");
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

const getExistingImageUrl = async (name, type) => {
  try {
    if (type === "artist") {
      const artist = await Artist.findOne({ name });
      if (
        artist?.imageUrls?.webp &&
        artist.imageUrls.webp !== DEFAULT_ARTIST_IMAGE.webp
      ) {
        return artist.imageUrls;
      }
    } else if (type === "album") {
      const album = await Album.findOne({ title: name });
      if (
        album?.coverUrls?.webp &&
        album.coverUrls.webp !== DEFAULT_COVER.webp
      ) {
        return album.coverUrls;
      }
    }
    return null;
  } catch (error) {
    config.logger.error(
      `Erreur lors de la recherche d'images pour ${type} ${name}:`,
      error
    );
    return null;
  }
};

const getImageUrlsForEntity = async (imageBuffer, name, type) => {
  try {
    const existingImageUrls = await getExistingImageUrl(name, type);
    if (
      existingImageUrls &&
      existingImageUrls.webp !==
        (type === "album" ? DEFAULT_COVER.webp : DEFAULT_ARTIST_IMAGE.webp)
    ) {
      return existingImageUrls;
    }

    const savedImageUrls = await convertAndSaveImage(imageBuffer);
    return (
      savedImageUrls ||
      (type === "album" ? DEFAULT_COVER : DEFAULT_ARTIST_IMAGE)
    );
  } catch (error) {
    config.logger.error(
      `❌ Erreur lors du traitement des images pour ${type} ${name}:`,
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
    const imageUrls = await getImageUrlsForEntity(
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
      imageUrl: imageUrls.webp,
      imageUrls
    });
    await artist.save();
  } else if (
    tags.image?.imageBuffer &&
    artist.imageUrls?.webp === DEFAULT_ARTIST_IMAGE.webp
  ) {
    const imageUrls = await getImageUrlsForEntity(
      tags.image.imageBuffer,
      artistName,
      "artist"
    );
    artist.imageUrl = imageUrls.webp;
    artist.imageUrls = imageUrls;
    await artist.save();
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
    const coverUrls = await getImageUrlsForEntity(
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
      coverUrl: coverUrls.webp,
      coverUrls,
      popularity: faker.number.int({ min: 0, max: 100 }),
      tracks: [],
      trackCount: 0
    });
    await album.save();

    if (!artist.albums.includes(album._id)) {
      artist.albums.push(album._id);
      artist.genres = [...new Set([...artist.genres, ...albumGenres])];
      await artist.save();
    }
  } else if (
    tags.image?.imageBuffer &&
    album.coverUrls?.webp === DEFAULT_COVER.webp
  ) {
    const coverUrls = await getImageUrlsForEntity(
      tags.image.imageBuffer,
      albumName,
      "album"
    );
    album.coverUrl = coverUrls.webp;
    album.coverUrls = coverUrls;
    await album.save();
  }

  return album;
};
const seedAudiosFromFiles = async () => {
  try {
    const files = fs
      .readdirSync(audioDirectory)
      .filter((file) => file.endsWith(".mp3"));

    for (const file of files) {
      const mp3FilePath = path.join(audioDirectory, file);
      const wavFileName = path.basename(file, ".mp3") + ".wav";
      const wavFilePath = path.join(wavDirectory, wavFileName);

      if (!fs.existsSync(wavFilePath)) {
        try {
          await convertToWav(mp3FilePath, wavFilePath);
        } catch (error) {
          config.logger.error(
            `❌ Erreur lors de la conversion de ${file}:`,
            error
          );
          continue;
        }
      }

      if (!fs.existsSync(wavFilePath)) {
        config.logger.error(
          `❌ Fichier WAV non trouvé après conversion: ${wavFilePath}`
        );
        continue;
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

      const relativeMP3Path = `${RELATIVE_MP3_PATH}/${file}`;
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

        const audioUrls = {
          mp3: relativeMP3Path,
          wav: relativeWAVPath
        };

        audio = new Audio({
          title: finalTrackName,
          artist: artist._id,
          album: album ? album._id : null,
          duration,
          audioUrl: relativeWAVPath,
          audioUrls,
          genres: album ? album.genres : artist.genres,
          popularity: faker.number.int({ min: 0, max: 100 }),
          releaseDate: releaseDate
        });

        await audio.save();
        config.logger.info(
          `Audio créé avec les URLs: ${JSON.stringify(audioUrls)}`
        );

        if (album && !album.tracks.includes(audio._id)) {
          album.tracks.push(audio._id);
          await album.save();
        }
      } else {
        if (!audio.audioUrls || !audio.audioUrls.wav) {
          audio.audioUrls = {
            mp3: relativeMP3Path,
            wav: relativeWAVPath
          };
          audio.audioUrl = relativeWAVPath;
          await audio.save();
        }
      }
    }

    config.logger.info("✅ Seeding des audios terminé avec succès !");
  } catch (error) {
    config.logger.error("❌ Erreur lors du seeding:", error);
    config.logger.error(error.stack);
  } finally {
    mongoose.connection.close();
  }
};
module.exports = seedAudiosFromFiles;
