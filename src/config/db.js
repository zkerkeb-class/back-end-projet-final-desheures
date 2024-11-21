const mongoose = require('mongoose');
const config = require('./env');

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${config.mongo_user}:${config.mongo_pwd}@${config.mongo_cluster}.mongodb.net/`
    );
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
