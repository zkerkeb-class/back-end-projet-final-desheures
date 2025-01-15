const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const Artist = require("./models/Artist");
const Album = require("./models/Album");
const Audio = require("./models/Audio");
const Playlist = require("./models/Playlist");

mongoose.connect(config.env.mongo_uri);

const audioDir = path.join(__dirname, "../uploads/audios");
const imageDir = path.join(__dirname, "../uploads/images");

// Fonction pour récupérer les fichiers dans un dossier
const getFilesFromDirectory = (directory) => {
  try {
    return fs
      .readdirSync(directory)
      .filter((file) => fs.statSync(path.join(directory, file)).isFile());
  } catch (error) {
    console.error(`Erreur lors de la lecture du dossier ${directory}:`, error);
    return [];
  }
};

const createFakeData = async () => {
  try {
    await Artist.deleteMany({});
    await Album.deleteMany({});
    await Audio.deleteMany({});
    await Playlist.deleteMany({});

    const artists = [];
    const albums = [];
    const audios = [];
    const playlists = [];

    const audioFiles = getFilesFromDirectory(audioDir);
    const imageFiles = getFilesFromDirectory(imageDir);

    if (audioFiles.length === 0 || imageFiles.length === 0) {
      console.error(
        "Les dossiers audio ou image sont vides. Veuillez ajouter des fichiers."
      );
      process.exit(1);
    }

    for (let i = 0; i < 10; i++) {
      const artist = new Artist({
        name: faker.person.fullName(),
        namePhonetic: faker.word.noun(),
        genres: [faker.music.genre(), faker.music.genre()],
        bio: faker.lorem.paragraph(),
        imageUrl: `uploads/images/${faker.helpers.arrayElement(imageFiles)}`,
        socialLinks: [
          { platform: "Twitter", url: faker.internet.url() },
          { platform: "Instagram", url: faker.internet.url() }
        ],
        popularity: faker.number.int({ min: 0, max: 100 })
      });
      const savedArtist = await artist.save();
      artists.push(savedArtist);
    }

    for (const artist of artists) {
      const artistAlbums = [];

      for (let i = 0; i < 3; i++) {
        const album = new Album({
          title: faker.word.words({ count: { min: 2, max: 5 } }),
          artist: artist._id,
          releaseDate: faker.date.past(),
          genres: artist.genres,
          coverUrl: `uploads/images/${faker.helpers.arrayElement(imageFiles)}`,
          trackCount: 0,
          popularity: faker.number.int({ min: 0, max: 100 })
        });
        const savedAlbum = await album.save();
        artistAlbums.push(savedAlbum);
        artist.albums.push(savedAlbum._id);
        await artist.save();
        albums.push(savedAlbum);

        for (let j = 0; j < 20; j++) {
          if (audioFiles.length === 0) {
            break;
          }

          const audioFile = faker.helpers.arrayElement(audioFiles);

          const audio = new Audio({
            title: faker.word.words({ count: { min: 2, max: 5 } }),
            artist: artist._id,
            album: savedAlbum._id,
            duration: faker.number.int({ min: 120, max: 300 }),
            audioUrl: `uploads/audios/${audioFile}`,
            lyrics: faker.lorem.paragraph(),
            tempo: faker.number.int({ min: 60, max: 180 }),
            mood: faker.word.adjective(),
            genres: savedAlbum.genres,
            popularity: faker.number.int({ min: 0, max: 100 }),
            releaseDate: faker.date.past()
          });
          const savedAudio = await audio.save();
          savedAlbum.tracks.push(savedAudio._id);
          savedAlbum.trackCount++;
          await savedAlbum.save();
          audios.push(savedAudio);
        }
      }
    }

    for (let i = 0; i < 5; i++) {
      const playlistTracks = faker.helpers.arrayElements(audios, 10);
      const totalDuration = playlistTracks.reduce(
        (sum, track) => sum + track.duration,
        0
      );

      const playlist = new Playlist({
        name: faker.word.words({ count: { min: 2, max: 5 } }),
        description: faker.lorem.sentence(),
        tracks: playlistTracks.map((track) => track._id),
        coverUrl: `uploads/images/${faker.helpers.arrayElement(imageFiles)}`,
        trackCount: playlistTracks.length,
        totalDuration,
        popularity: faker.number.int({ min: 0, max: 100 })
      });
      const savedPlaylist = await playlist.save();
      playlists.push(savedPlaylist);
    }

    config.logger.info("Données générées avec succès dans MongoDB !");
    process.exit();
  } catch (error) {
    config.logger.error(
      "Erreur lors de la création des données factices :",
      error
    );
    process.exit(1);
  }
};

createFakeData();
