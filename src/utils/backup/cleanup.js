const fs = require("fs");
const path = require("path");
const moment = require("moment");
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
      }
    }
  });
};

const cleanupTempFiles = () => {
  const tempPath = backupConfig.paths.temp;
  fs.rmSync(tempPath, { recursive: true, force: true });
};

module.exports = { cleanupOldBackups, cleanupTempFiles };
