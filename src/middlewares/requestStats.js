const requestStats = {
  success: 0,
  error: 0
};

const requestStatsMiddleware = (req, res, next) => {
  // Écouter l'événement 'finish' une fois la réponse envoyée
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      requestStats.success += 1; // Succès pour les statuts 2xx
    } else if (res.statusCode >= 400) {
      requestStats.error += 1; // Erreurs pour les statuts 4xx et 5xx
    }

    console.log(`[STATS] Succès : ${requestStats.success}, Échecs : ${requestStats.error}`);
  });

  next();
};

// Route pour consulter les statistiques
const getRequestStats = (req, res) => {
  res.status(200).json({
    success: requestStats.success,
    error: requestStats.error,
    total: requestStats.success + requestStats.error
  });
};

module.exports = { requestStatsMiddleware, getRequestStats };
