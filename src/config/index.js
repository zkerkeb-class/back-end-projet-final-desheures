require("dotenv").config();

const config = {
  port: process.env.PORT,
  frontend_url: process.env.FRONTEND_URL,
  backoffice_url: process.env.BACKOFFICE_URL,
};

module.exports = config;
