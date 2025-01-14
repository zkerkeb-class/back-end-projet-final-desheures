const redisConfig = require("./redis");

module.exports = {
  connectToDatabase: require("./db"),
  env: require("./env"),
  swaggerSpec: require("./swagger"),
  logger: require("./logger"),
  redis: redisConfig.redisClient,
  checkRedisReady: redisConfig.isRedisReady
};
