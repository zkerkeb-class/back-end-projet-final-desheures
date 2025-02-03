
// const redisClient = require("../redisClient"); // Chemin vers votre fichier de configuration Redis
// const { redisClient } = require("../config/redis");
// const logger = require("../config/logger");

module.exports = {
  APIReqestTime: async(req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start; // Temps en millisecondes
      // const metricKey = `metrics:${req.method}:${req.originalUrl}`;
      console.log(`[METRICS] ${req.method} ${req.originalUrl} - ${duration}ms`);

      // Enregistrer la durée de la requête dans Redis
      // redisClient.lPush(metricKey, duration, (err) => {
      //   if (err) {logger.error(`Erreur lors de l'enregistrement de la métrique: ${err}`);}
      // });

      // Définir une expiration pour les métriques enregistrées
      // redisClient.expire(metricKey, 3600);
    });

    next();
  }


}

