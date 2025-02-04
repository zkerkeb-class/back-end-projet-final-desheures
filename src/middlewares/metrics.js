const config = require("../config");

module.exports = {
  APIReqestTime: async (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;

      config.logger.info(
        `[METRICS] ${req.method} ${req.originalUrl} - ${duration}ms`
      );
    });

    next();
  }
};
