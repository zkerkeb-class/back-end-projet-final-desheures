const connectToDatabase = require('./db');
const env = require('./env');
const swaggerSpec = require('./swagger');

module.exports = {
  connectToDatabase,
  env,
  swaggerSpec
};
