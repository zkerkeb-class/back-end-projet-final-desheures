const fs = require("fs");
const path = require("path");
const config = require("../../config");
const backupConfig = require("./backup.config");

const ensureDirectoriesExist = () => {
  const directories = [
    backupConfig.paths.backup,
    backupConfig.paths.temp,
    path.join(backupConfig.paths.backup, "mongodb"),
    path.join(backupConfig.paths.backup, "media")
  ];
  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      config.logger.info(`Création du répertoire: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

module.exports = { ensureDirectoriesExist };
