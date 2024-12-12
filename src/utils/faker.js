const mongoose = require("mongoose");
const wavFileInfo = require("wav-file-info");
const fs = require("fs/promises");
const path = require("path");
const { faker } = require("@faker-js/faker");
const config = require("../config");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Audio = require("../models/Audio");

mongoose.connect(config.env.mongo_uri);

const audioDirectory = path.join(__dirname, "../../uploads/audios/");

const getAudioDuration = (filePath) => {
  return new Promise((resolve) => {
    const { getAudioDurationInSeconds } = require("get-audio-duration");
    getAudioDurationInSeconds(filePath)
      .then(resolve)
      .catch((err) => {
        config.logger.warn(
          `Could not get duration for ${filePath}, using faker, ${err.message}`
        );
        resolve(faker.number.int({ min: 120, max: 300 }));
      });
  });
};

const getWavMetadata = (filePath) => {
  return new Promise((resolve) => {
    wavFileInfo.infoByFilename(filePath, (err, info) => {
      if (err) {
        config.logger.warn(
          `Could not extract metadata for ${filePath}, using faker.`
        );
        return resolve(null);
      }

      const riffInfo = info.header;

      const metadata = {
        artist: riffInfo.artist || null,
        album: riffInfo.album || null,
        title: riffInfo.title || null
      };

      resolve(metadata);
    });
  });
};

const createFakeDataFromAudio = async () => {
  try {
    await Artist.deleteMany({});
    await Album.deleteMany({});
    await Audio.deleteMany({});

    const files = await fs.readdir(audioDirectory);

    for (const file of files) {
      const filePath = path.join(audioDirectory, file);

      if (!file.toLowerCase().endsWith(".wav")) {
        config.logger.warn(`Skipping unsupported file: ${file}`);
        continue;
      }

      try {
        const metadata = await getWavMetadata(filePath);

        const artistName = metadata?.artist || faker.person.fullName();
        const albumName = metadata?.album || faker.word.words({ count: 3 });
        const title =
          metadata?.title || path.basename(file, path.extname(file));

        let artist = await Artist.findOne({ name: artistName });
        if (!artist) {
          artist = new Artist({
            name: artistName,
            genres: [faker.music.genre()],
            bio: faker.lorem.paragraph(),
            imageUrl: faker.image.avatar()
          });
          artist = await artist.save();
        }

        let album = await Album.findOne({
          title: albumName,
          artist: artist._id
        });
        if (!album) {
          album = new Album({
            title: albumName,
            artist: artist._id,
            releaseDate: faker.date.past(),
            genres: artist.genres,
            coverUrl: faker.image.url()
          });
          album = await album.save();
          artist.albums.push(album._id);
          await artist.save();
        }

        const duration = await getAudioDuration(filePath);

        const audio = new Audio({
          title,
          artist: artist._id,
          album: album._id,
          duration,
          audioUrl: `/uploads/audio/${file}`,
          genres: album.genres
        });
        await audio.save();

        album.tracks.push(audio._id);
        album.trackCount++;
        await album.save();

        config.logger.info(`Audio ajouté : ${audio.title}`);
      } catch (parseError) {
        config.logger.error(`Error processing file ${file}:`, parseError);
      }
    }

    config.logger.info("Données créées à partir des fichiers audio.");
    process.exit();
  } catch (err) {
    config.logger.error("Erreur :", err);
    process.exit(1);
  }
};

createFakeDataFromAudio();
