const Artist = require("../../models/Artist");
const mongoose = require("mongoose");
const Album = require("../../models/Album");
const Audio = require("../../models/Audio");
const Playlist = require("../../models/Playlist");
// const seedArtists = require("./seedArtists");
const seedFromRealData = require("./seedingData");
const config = require("../../config");
const seedAudiosFromFiles = require("./seedingAudio");
mongoose
  .connect(config.env.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connexion à MongoDB réussie !");
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB:", err);
    process.exit(1);
  });
const seedDatabase = async () => {
  try {
    console.log("Nettoyage de la base de données...");
    await Promise.all([
      Artist.deleteMany({}),
      Album.deleteMany({}),
      Audio.deleteMany({}),
      Playlist.deleteMany({})
    ]);

    console.log("Ajout des données réelles...");
    await seedFromRealData();
    await seedAudiosFromFiles();
    // console.log("Ajout des données générées...");
    // await seedArtists();

    console.log("Seeding terminé !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors du seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
