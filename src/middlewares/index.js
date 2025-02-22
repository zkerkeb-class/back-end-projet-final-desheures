module.exports = {
  corsOptions: require("./cors.js"),
  bodyParser: require("./bodyParser.js"),
  // dbTimer: require("./dbTimer.js"),
  helmet: require("./helmet.js"),
  isAuth: require("./isAuth.js"),
  metrics: require("./metrics.js"),
  multer: require("./multer.js"),
  rateLimiter: require("./rateLimiter.js"),
  // redisLatency: require("./redisLatency.js"),
  // requestStats: require("./requestStats.js"),
  redisCache: require("./redisCache.js.sample")
};
