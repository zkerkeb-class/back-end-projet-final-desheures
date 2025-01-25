const fs = require("fs");
const path = require("path");
const moment = require("moment");
const config = require("../../config");
const backupConfig = require("./backup.config");

const cleanupOldBackups = () => {
  const backupsPath = backupConfig.paths.backup;
  const expirationDate = moment().subtract(backupConfig.retentionDays, "days");

  fs.readdirSync(backupsPath).forEach((folder) => {
    const folderPath = path.join(backupsPath, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const folderDate = moment(folder, backupConfig.folderFormat);
      if (folderDate.isValid() && folderDate.isBefore(expirationDate)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        config.logger.info(`Ancien répertoire supprimé: ${folderPath}`);
      }
    }
  });
};

const cleanupTempFiles = () => {
  const tempPath = backupConfig.paths.temp;
  fs.rmSync(tempPath, { recursive: true, force: true });
  config.logger.info("Tous les fichiers temporaires ont été supprimés");
};

module.exports = { cleanupOldBackups, cleanupTempFiles };
