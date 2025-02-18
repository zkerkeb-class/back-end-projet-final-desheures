const requestStats = {
  success: 0,
  error: 0
};

const requestStatsMiddleware = (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      requestStats.success += 1;
    } else if (res.statusCode >= 400) {
      requestStats.error += 1;
    }
  });
  next();
};

const getRequestStats = (req, res) => {
  res.status(200).json({
    success: requestStats.success,
    error: requestStats.error,
    total: requestStats.success + requestStats.error
  });
};

module.exports = { requestStatsMiddleware, getRequestStats };
