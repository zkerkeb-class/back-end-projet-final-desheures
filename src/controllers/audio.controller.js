/* eslint-disable curly */
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const {
  convertAndSaveImage,
  processAudioFile,
  DEFAULT_IMAGES,
  directories
} = require("../utils/convert/convertAudio");
const { faker } = require("@faker-js/faker");
const NodeID3 = require("node-id3");
const getMP3Duration = require("get-mp3-duration");
const Album = require("../models/Album");
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
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);
const { monitorMongoQuery } = require("../utils/metrics/metrics");

const config = require("../config");

const createOrUpdateArtist = async (artistName, tags) => {
  let artist = await Artist.findOne({ name: artistName });

  if (!artist) {
    let imageUrls = DEFAULT_IMAGES.ARTIST;
    let imageUrl = DEFAULT_IMAGES.ARTIST.webp;

    if (tags?.image?.imageBuffer) {
      const savedImageUrls = await convertAndSaveImage(tags.image.imageBuffer);
      if (savedImageUrls) {
        imageUrls = savedImageUrls;
        imageUrl = savedImageUrls.webp;
      }
    }

    artist = new Artist({
      name: artistName,
      bio: faker.lorem.paragraphs(2),
      popularity: faker.number.int({ min: 0, max: 100 }),
      genres: [],
      albums: [],
      imageUrl,
      imageUrls
    });
    await artist.save();
    config.logger.info(`Nouvel artiste créé: ${artistName}`);
  } else if (
    tags?.image?.imageBuffer &&
    artist.imageUrl === DEFAULT_IMAGES.ARTIST.webp
  ) {
    const savedImageUrls = await convertAndSaveImage(tags.image.imageBuffer);
    if (savedImageUrls) {
      artist.imageUrls = savedImageUrls;
      artist.imageUrl = savedImageUrls.webp;
      await artist.save();
      config.logger.info(`Images mises à jour pour l'artiste: ${artistName}`);
    }
  }

  return artist;
};

const createOrUpdateAlbum = async (trackName, artist, tags) => {
  const albumName = tags.album || trackName || "Unknown Album";

  let album = await Album.findOne({
    title: albumName,
    artist: artist._id
  });

  if (!album) {
    const coverUrls =
      (await convertAndSaveImage(tags.image?.imageBuffer)) ||
      DEFAULT_IMAGES.COVER;
    const coverUrl = coverUrls.webp;

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
      releaseDate,
      genres: albumGenres,
      coverUrl,
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

    config.logger.info(`Nouvel album créé: ${albumName}`);
  } else if (
    tags?.image?.imageBuffer &&
    album.coverUrl === DEFAULT_IMAGES.COVER.webp
  ) {
    const coverUrls = await convertAndSaveImage(tags.image.imageBuffer);
    if (coverUrls) {
      album.coverUrls = coverUrls;
      album.coverUrl = coverUrls.webp;
      await album.save();
      config.logger.info(`Images mises à jour pour l'album: ${albumName}`);
    }
  }

  return album;
};

module.exports = {
  convertAudio: async (req, res) => {
    try {
      const { buffer, originalname } = req.file;

      if (!originalname.toLowerCase().endsWith(".mp3")) {
        return res.status(400).json({
          message: "Only MP3 files are accepted"
        });
      }

      if (!buffer) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }
      const mp3Dir = "uploads/audios/mp3";
      const wavDir = "uploads/audios/wav";

      [mp3Dir, wavDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      const mp3FilePath = path.join(mp3Dir, originalname);
      const wavFileName = originalname.replace(".mp3", ".wav");
      const wavFilePath = path.join(wavDir, wavFileName);

      // eslint-disable-next-line no-unused-vars
      return new Promise((resolve, reject) => {
        tmp.file({ postfix: ".mp3" }, async (err, tempFilePath) => {
          if (err) {
            return res.status(500).json({
              message: "Failed to create temporary file",
              error: err.message
            });
          }

          try {
            await fs.promises.writeFile(tempFilePath, buffer);

            await fs.promises.copyFile(tempFilePath, mp3FilePath);

            await new Promise((resolve, reject) => {
              ffmpeg()
                .input(tempFilePath)
                .toFormat("wav")
                .output(wavFilePath)
                .on("end", resolve)
                .on("error", reject)
                .run();
            });

            const mp3Exists = fs.existsSync(mp3FilePath);
            const wavExists = fs.existsSync(wavFilePath);

            if (!mp3Exists || !wavExists) {
              throw new Error("Failed to create one or both audio files");
            }

            const relativeMP3Path = `uploads/audios/mp3/${originalname}`;
            const relativeWAVPath = `uploads/audios/wav/${wavFileName}`;

            res.status(200).json({
              message: "Audio uploaded and converted successfully",
              paths: {
                mp3: relativeMP3Path,
                wav: relativeWAVPath
              }
            });
          } catch (error) {
            try {
              if (fs.existsSync(mp3FilePath)) {
                fs.unlinkSync(mp3FilePath);
              }
              if (fs.existsSync(wavFilePath)) {
                fs.unlinkSync(wavFilePath);
              }
            } catch (cleanupError) {
              config.logger.error("Cleanup error:", cleanupError);
            }

            res.status(500).json({
              message: "An error occurred during audio processing",
              error: error.message
            });
          } finally {
            try {
              fs.unlinkSync(tempFilePath);
            } catch (cleanupError) {
              config.logger.error("Temp file cleanup error:", cleanupError);
            }
          }
        });
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurred",
        error: error.message
      });
    }
  },
  createAudio: async (req, res) => {
    try {
      const { file, body } = req;

      if (!file || !file.buffer) {
        return res.status(400).json({
          message: "Un fichier audio est requis"
        });
      }

      if (!file.originalname.toLowerCase().endsWith(".mp3")) {
        return res.status(400).json({
          message: "Seuls les fichiers MP3 sont acceptés"
        });
      }

      const existingAudio = await Audio.findOne({
        "audioUrls.mp3": `uploads/audios/mp3/${file.originalname}`
      });

      if (existingAudio) {
        return res.status(409).json({
          message: "Un audio avec ce nom existe déjà",
          existingAudio
        });
      }

      const audioPaths = await processAudioFile(file.buffer, file.originalname);

      const tags = NodeID3.read(audioPaths.absoluteMp3Path);
      const duration = getMP3Duration(file.buffer) / 1000;

      const artistName = tags.artist || body.artist;
      if (!artistName) {
        return res.status(400).json({
          message: "Le nom de l'artiste est requis (dans les tags ou le body)"
        });
      }
      const artist = await createOrUpdateArtist(artistName, tags);

      const trackName =
        tags.title ||
        body.title ||
        file.originalname.replace(/\.(mp3|wav)$/i, "");
      const album = await createOrUpdateAlbum(trackName, artist, tags);

      const audioData = {
        title: trackName,
        artist: artist._id,
        album: album ? album._id : null,
        duration,
        audioUrl: audioPaths.wavPath,
        audioUrls: {
          mp3: audioPaths.mp3Path,
          wav: audioPaths.wavPath
        },
        genres: album
          ? album.genres
          : tags.genre
            ? [tags.genre]
            : body.genres || [],
        releaseDate: tags.year
          ? new Date(Number(tags.year), 0)
          : body.releaseDate,
        popularity: faker.number.int({ min: 0, max: 100 })
      };
      const audio = new Audio(audioData);
      const savedAudio = await audio.save();

      if (album) {
        album.tracks.push(savedAudio._id);
        album.trackCount = album.tracks.length;
        await album.save();
      }
      await config.redis.flushAll();

      res.status(201).json({
        message: "Audio créé avec succès",
        audio: savedAudio
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la création de l'audio",
        error: error.message
      });
    }
  },
  getAllAudios: async (req, res) => {
    try {
      const cachedAudios = await config.redis.get("audios:all");

      if (cachedAudios) {
        return res.status(200).json(JSON.parse(cachedAudios));
      }

      const audios = await monitorMongoQuery("find", "Audio", () => {
        return Audio.find()
          .populate("artist", "name imageUrl imageUrls")
          .populate("album", "title coverUrl coverUrls")
          .exec();
      });

      await config.redis.set("audios:all", JSON.stringify(audios), {
        EX: 3600
      });

      res.status(200).json(audios);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des audios",
        error: error.message
      });
    }
  },

  getAudioById: async (req, res) => {
    try {
      const cacheKey = `audios:${req.params.id}`;
      const cachedAudio = await config.redis.get(cacheKey);

      if (cachedAudio) {
        return res.status(200).json(JSON.parse(cachedAudio));
      }

      const audio = await monitorMongoQuery("findById", "Audio", () => {
        return Audio.findById(req.params.id)
          .populate("artist", "name imageUrl imageUrls")
          .populate("album", "title coverUrl coverUrls")
          .exec();
      });

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
        error: error.message
      });
    }
  },
  updateAudio: async (req, res) => {
    try {
      const updatedAudio = await monitorMongoQuery("update", "Audio", () => {
        return Audio.findByIdAndUpdate(req.params.id, req.body, {
          new: true
        })
          .populate("artist", "name imageUrl imageUrls")
          .populate("album", "title coverUrl coverUrls")
          .exec();
      });

      if (!updatedAudio) {
        return res.status(404).json({ message: "Audio non trouvé" });
      }

      const cacheKey = `audios:${req.params.id}`;
      await config.redis.set(cacheKey, JSON.stringify(updatedAudio), {
        EX: 3600
      });

      await config.redis.del("audios:all");

      res.status(200).json(updatedAudio);
    } catch (error) {
      res.status(400).json({
        message: "Erreur lors de la mise à jour de l'audio",
        error: error.message
      });
    }
  },

  deleteAudio: async (req, res) => {
    try {
      const deletedAudio = await monitorMongoQuery("delete", "Audio", () =>
        Audio.findByIdAndDelete(req.params.id).exec()
      );

      if (!deletedAudio) {
        return res.status(404).json({ message: "Audio non trouvé" });
      }

      // Si l'audio fait partie d'un album, mettre à jour l'album
      if (deletedAudio.album) {
        const album = await Album.findById(deletedAudio.album);
        if (album) {
          album.tracks = album.tracks.filter(
            (trackId) => trackId.toString() !== deletedAudio._id.toString()
          );
          album.trackCount = album.tracks.length;
          await album.save();
        }
      }

      // Supprimer les fichiers physiques
      try {
        const mp3Path = path.join(
          directories.mp3,
          path.basename(deletedAudio.audioUrls.mp3)
        );
        const wavPath = path.join(
          directories.wav,
          path.basename(deletedAudio.audioUrls.wav)
        );

        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
      } catch (fileError) {
        config.logger.error(
          "Erreur lors de la suppression des fichiers:",
          fileError
        );
      }

      // Nettoyer le cache
      const cacheKey = `audios:${req.params.id}`;
      await config.redis.del(cacheKey);
      await config.redis.del("audios:all");

      res.status(200).json({
        message: "Audio supprimé avec succès",
        audio: deletedAudio
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la suppression de l'audio",
        error: error.message
      });
    }
  },
  createOrUpdateArtist,
  createOrUpdateAlbum
};
