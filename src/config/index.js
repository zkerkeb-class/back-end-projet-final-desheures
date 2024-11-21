require('dotenv').config();

const config = {
  port: process.env.PORT,
  frontend_url: process.env.FRONTEND_URL,
  backoffice_url: process.env.BACKOFFICE_URL,
  mongo_user: process.env.MONGO_USER,
  mongo_pwd: process.env.MONGO_PWD,
  mongo_cluster: process.env.MONGO_CLUSTER
};

module.exports = config;
