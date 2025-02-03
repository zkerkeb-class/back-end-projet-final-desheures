const cors = require("cors");
const env = require("../config/env");

const allowedOrigins = [env.frontend_url, env.backoffice_url];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, origin || allowedOrigins[0]);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

module.exports = cors(corsOptions);
