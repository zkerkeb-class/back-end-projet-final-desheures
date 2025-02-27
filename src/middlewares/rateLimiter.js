const rateLimit = require("express-rate-limit");

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: "Too many requests",
    message: "You have exceeded the 100 requests in 15 mins limit!"
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = apiRateLimiter;
