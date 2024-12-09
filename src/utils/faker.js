const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const config = require("../config");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Playlist = require("../models/Playlist");

mongoose.connect(config.env.mongo_uri);

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

    for (let i = 0; i < 10; i++) {
      const artist = new Artist({
        name: faker.person.fullName(),
        namePhonetic: faker.word.noun(),
        genres: [faker.music.genre(), faker.music.genre()],
        bio: faker.lorem.paragraph(),
        imageUrl: faker.image.avatar(),
        socialLinks: [
          { platform: "Twitter", url: faker.internet.url() },
          { platform: "Instagram", url: faker.internet.url() }
        ],
        popularity: faker.number.int({ min: 0, max: 100 })
      });
      const savedArtist = await artist.save();
      artists.push(savedArtist);
    }
    for (let i = 0; i < 15; i++) {
      const artist = faker.helpers.arrayElement(artists);
      const album = new Album({
        title: faker.word.words({ count: { min: 2, max: 5 } }),
        artist: artist._id,
        releaseDate: faker.date.past(),
        genres: artist.genres,
        coverUrl: faker.image.urlLoremFlickr({
          category: "music",
          width: 300,
          height: 300
        }),
        trackCount: 0,
        popularity: faker.number.int({ min: 0, max: 100 })
      });
      const savedAlbum = await album.save();
      artist.albums.push(savedAlbum._id);
      await artist.save();
      albums.push(savedAlbum);
    }

    // Créer des audios factices
    for (let i = 0; i < 50; i++) {
      const artist = faker.helpers.arrayElement(artists);
      const album = faker.helpers.arrayElement(albums);
      const audio = new Audio({
        title: faker.word.words({ count: { min: 2, max: 5 } }),
        artist: artist._id,
        album: album._id,
        duration: faker.number.int({ min: 120, max: 300 }), // Durée en secondes
        audioUrl: faker.internet.url(),
        lyrics: faker.lorem.paragraph(),
        tempo: faker.number.int({ min: 60, max: 180 }),
        mood: faker.word.adjective(),
        genres: album.genres,
        popularity: faker.number.int({ min: 0, max: 100 })
      });
      const savedAudio = await audio.save();
      album.tracks.push(savedAudio._id);
      album.trackCount++;
      await album.save();
      audios.push(savedAudio);
    }

    for (let i = 0; i < 5; i++) {
      const playlistTracks = faker.helpers.arrayElements(audios, 10); // Sélectionner 10 pistes au hasard
      const totalDuration = playlistTracks.reduce(
        (sum, track) => sum + track.duration,
        0
      );

      const playlist = new Playlist({
        name: faker.word.words({ count: { min: 2, max: 5 } }),
        description: faker.lorem.sentence(),
        tracks: playlistTracks.map((track) => track._id),
        coverUrl: faker.image.urlLoremFlickr({
          category: "music",
          width: 300,
          height: 300
        }),
        trackCount: playlistTracks.length,
        totalDuration,
        popularity: faker.number.int({ min: 0, max: 100 })
      });
      const savedPlaylist = await playlist.save();
      playlists.push(savedPlaylist);
    }

    config.logger.info("Data in mongoDB!");
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
