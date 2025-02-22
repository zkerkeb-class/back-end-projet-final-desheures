const config = require("../config");
const requestTime = [];
const dbTime = [];

  const APIReqestTime = async (req, res, next) => {
    if (req.path === '/api/metrics/APIRequestTime/') {
      return next(); // Ignore ce middleware pour cette route
    }
    const start = Date.now();


    res.on("finish", () => {
      const durationTime = Date.now() - start;
      config.logger.info(
        `[METRICS_APIReqestTime] ${req.method} ${req.originalUrl} - ${durationTime}ms`
      );
      requestTime.push({
        method: req.method,
        endPoint: req.originalUrl,
        duration: durationTime
      });
    });
    next();

  }

  const getAPIRequestTime = async (req, res) => {
    res.status(200).json(requestTime);
    config.logger.info(
      `[METRICS_getAPIRequestTime] ${requestTime.method} ${requestTime.endPoint} - ${requestTime.duration}ms`
    )
  }

  const dbTimer = async (req, res, next) => {
    const startTime = process.hrtime();
  
    res.on("finish", () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const executionTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
  
      config.logger.info(
        `[METRICS_DBTimer] ${req.method} ${req.originalUrl} - ${executionTimeMs}ms`
      );
      dbTime.push({
        method: req.method,
        endPoint: req.originalUrl,
        executionTimeMs: executionTimeMs
      });
    });
  
    next();
  }

  const getDbTimer = async (req, res, next) => {
    res.status(200).json(dbTime);
    config.logger.info(
      `[METRICS_getDbTimer] ${dbTime.method} ${dbTime.endPoint} - ${dbTime.executionTimeMs}ms`
    )
  }


module.exports = { APIReqestTime, getAPIRequestTime, dbTimer, getDbTimer }