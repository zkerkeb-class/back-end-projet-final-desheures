const moment = require("moment");
const config = require("../../config");
const backupConfig = require("./backup.config");
const { ensureDirectoriesExist } = require("./ensureDirectoriesExist");
const { backupMongoDB, testRestore } = require("./mongoBackup");
const { archiveMediaFiles } = require("./mediaBackup");
const { moveToStorage } = require("./fileUtils");
const { cleanupOldBackups, cleanupTempFiles } = require("./cleanup");
const { sendNotification } = require("./notification");

const performBackup = async () => {
  const timestamp = moment().format(backupConfig.timeFormat);
  config.logger.info(timestamp);
  const backupResults = { success: true, errors: [] };

  try {
    ensureDirectoriesExist();

    const mongoBackupPath = await backupMongoDB(timestamp);

    await testRestore(mongoBackupPath);

    await moveToStorage(mongoBackupPath, timestamp, "mongodb");

    const mediaArchivePath = await archiveMediaFiles(timestamp);
    await moveToStorage(mediaArchivePath, timestamp, "media");

    cleanupOldBackups();
    cleanupTempFiles();

    config.logger.info("Backup terminé avec succès.");
    await sendNotification(
      "Backup Réussi",
      `Le backup complet a été effectué avec succès le ${moment().format("DD/MM/YYYY HH:mm")}.`,
      "success"
    );
  } catch (error) {
    config.logger.error("❌ Erreur lors du processus de backup :", error);
    backupResults.success = false;
    backupResults.errors.push(error.message);

    await sendNotification(
      "❌ Erreur de Backup",
      `Une erreur est survenue lors du backup : ${error.message}`,
      "5"
    );
  }

  return backupResults;
};

module.exports = { performBackup };
