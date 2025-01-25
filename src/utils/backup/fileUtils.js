const fs = require("fs");
const path = require("path");
const moment = require("moment");
const config = require("../../config");
const backupConfig = require("./backup.config");

const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  return arrayOfFiles;
};

const moveToStorage = async (filePath, timestamp, type) => {
  const fileName = path.basename(filePath);
  const dateFolder = moment(timestamp, backupConfig.timeFormat).format(
    backupConfig.folderFormat
  );
  const destinationDir = path.join(backupConfig.paths.backup, type, dateFolder);
  const destinationPath = path.join(destinationDir, fileName);

  config.logger.info(`Déplacement de ${filePath} vers ${destinationPath}`);

  try {
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    fs.copyFileSync(filePath, destinationPath);
    fs.unlinkSync(filePath);
    return destinationPath;
  } catch (error) {
    throw new Error(
      `Erreur lors du déplacement vers le stockage: ${error.message}`
    );
  }
};

module.exports = { getAllFiles, moveToStorage };
