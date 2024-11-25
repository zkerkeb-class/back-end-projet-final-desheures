const connectToDatabase = require('./db');
const env = require('./env');
const swagger = require('./swagger');

module.exports = {
  connectToDatabase,
  env,
  swagger
};
