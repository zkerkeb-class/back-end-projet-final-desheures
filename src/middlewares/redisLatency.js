const { performance } = require("perf_hooks");

module.exports = (redisClient) => {
  return async (req, res, next) => {
    try {
      const startPing = performance.now();
      await redisClient.ping(); // Vérifie si Redis est accessible
      const endPing = performance.now();

      req.redisMetrics = {
        pingLatency: (endPing - startPing).toFixed(2), // En millisecondes
        operations: [] // Contiendra les autres latences
      };

      next();
    } catch (err) {
      console.error("Erreur lors de la mesure de latence Redis :", err);
      next(); // Continue même si Redis est inaccessible
    }
  };
};
