const dtTimer = async (req, res, next) => {
  // Capture le moment où la requête commence
  const startTime = process.hrtime();

  // Écoute sur l'événement `finish` de la réponse
  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const executionTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    console.log(`[DB TIMER] Requête vers ${req.originalUrl} exécutée en ${executionTimeMs} ms`);
  });

  next();
};
module.exports = dtTimer;
