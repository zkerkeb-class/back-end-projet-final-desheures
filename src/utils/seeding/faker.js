const Artist = require("../../models/Artist");
const Album = require("../../models/Album");
const Audio = require("../../models/Audio");
const Playlist = require("../../models/Playlist");
const config = require("../../config");
const seedAudiosFromFiles = require("./seedingAudio");

const seedDatabase = async () => {
  try {
    await Promise.all([
      Artist.deleteMany({}),
      Album.deleteMany({}),
      Audio.deleteMany({}),
      Playlist.deleteMany({})
    ]);

    await seedAudiosFromFiles();

    config.logger.info("✅ Seeding terminé !");
    process.exit(0);
  } catch (error) {
    config.logger.error("❌ Erreur lors du seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
