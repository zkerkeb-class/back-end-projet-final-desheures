const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(env.mongo_uri, {
      dbName: "desheures"
    });
    logger.info("✅ MongoDB connected to main database");

    const backupConnection = await mongoose.createConnection(env.mongo_uri, {
      dbName: "desheures"
    });
    logger.info("✅ MongoDB connected to backup database");

    return { default: mongoose.connection, backup: backupConnection };
  } catch (err) {
    logger.error("❌ Error connecting to MongoDB : ", err);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
