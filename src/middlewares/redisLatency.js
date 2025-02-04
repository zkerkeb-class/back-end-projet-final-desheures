const { performance } = require("perf_hooks");
const config = require("../config");

module.exports = (redisClient) => {
  return async (req, res, next) => {
    try {
      const startPing = performance.now();
      await redisClient.ping();
      const endPing = performance.now();

      req.redisMetrics = {
        pingLatency: (endPing - startPing).toFixed(2),
        operations: []
      };

      next();
    } catch (err) {
      config.logger.error("Erreur lors de la mesure de latence Redis :", err);
      next();
    }
  };
};
