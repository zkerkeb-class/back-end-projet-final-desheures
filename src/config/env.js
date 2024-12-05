require("dotenv").config();
const logger = require("./logger");

const requiredEnvVariables = [
  "PORT",
  "FRONTEND_URL",
  "BACKOFFICE_URL",
  "MONGO_USER",
  "MONGO_PWD",
  "MONGO_CLUSTER",
  "JWT_SECRET",
  "ADMIN_PASSWORD",
  "MONGO_URI"
];

// Vérification des variables d'environnement manquantes
const missingEnvVariables = requiredEnvVariables.filter(
  (key) => !process.env[key]
);

if (missingEnvVariables.length > 0) {
  logger.error(
    `Environnement variables missing : ${missingEnvVariables.join(", ")}`
  );
  throw new Error("API stopped because of missing variables");
}

const env = {
  port: process.env.PORT,
  frontend_url: process.env.FRONTEND_URL,
  backoffice_url: process.env.BACKOFFICE_URL,
  mongo_user: process.env.MONGO_USER,
  mongo_pwd: process.env.MONGO_PWD,
  mongo_cluster: process.env.MONGO_CLUSTER,
  jwt_secret: process.env.JWT_SECRET,
  admin_password: process.env.ADMIN_PASSWORD,
  mongo_uri: process.env.MONGO_URI
};

module.exports = env;
