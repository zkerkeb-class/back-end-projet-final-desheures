const config = require("../config");

const dtTimer = async (req, res, next) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const executionTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    config.logger.info(
      `[METRICS] ${req.method} ${req.originalUrl} - ${executionTimeMs}ms`
    );
  });

  next();
};
module.exports = dtTimer;
