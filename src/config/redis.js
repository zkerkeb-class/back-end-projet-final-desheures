const redis = require("redis");
const logger = require("./logger");

const redisOptions = {
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
};

if (process.env.REDIS_PASSWORD) {
  redisOptions.password = process.env.REDIS_PASSWORD;
}

const redisClient = redis.createClient(redisOptions);
// const redisClient = redis.createClient({
//   url: process.env.REDIS_URL
// });

redisClient.on("error", (err) => {
  logger.error("❌ Redis error:", err);
});

redisClient.on("connect", () => {
  logger.info("✅ Redis client is connecting...");
});

redisClient.on("ready", async () => {
  logger.info("✅ Redis client is ready to use");

  try {
    await redisClient.flushAll();
    logger.info("✅ Redis cache cleared on initialization.");
  } catch (err) {
    logger.error("❌ Failed to clear Redis cache on initialization:", err);
  }
});

redisClient
  .connect()
  .then(() => logger.info("✅ Redis client connected successfully"))
  .catch((err) => logger.error("❌ Could not connect to Redis:", err));

async function isRedisReady() {
  try {
    await redisClient.ping();
    logger.info("✅ Redis is ready and responding.");
    return true;
  } catch (err) {
    logger.error("❌ Redis is not ready:", err);
    return false;
  }
}

module.exports = { redisClient, isRedisReady };
