const mongoose = require("mongoose");
const config = require("../config");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Playlist = require("../models/Playlist");

mongoose.connect(config.env.mongo_uri);

const clearDatabase = async () => {
  try {
    await Artist.deleteMany({});
    await Album.deleteMany({});
    await Audio.deleteMany({});
    await Playlist.deleteMany({});
    config.logger.info("Database empty");
    process.exit(0);
  } catch (error) {
    config.logger.error("Erreur lors de la suppression des données :", error);
    process.exit(1);
  }
};

clearDatabase();
