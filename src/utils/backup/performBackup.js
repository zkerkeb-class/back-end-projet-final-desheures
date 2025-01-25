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
    config.logger.info("Début du processus de backup...");
    ensureDirectoriesExist();

    // 1. Backup MongoDB
    config.logger.info("Création du backup MongoDB...");
    const mongoBackupPath = await backupMongoDB(timestamp);

    // 2. Test de restauration
    config.logger.info("Test de restauration MongoDB...");
    await testRestore(mongoBackupPath);

    // 3. Déplacement du backup MongoDB
    config.logger.info("Déplacement du backup MongoDB vers le stockage...");
    await moveToStorage(mongoBackupPath, timestamp, "mongodb");

    // 4. Archivage des fichiers média
    config.logger.info("Archivage des fichiers média...");
    const mediaArchivePath = await archiveMediaFiles(timestamp);
    await moveToStorage(mediaArchivePath, timestamp, "media");

    // 5. Nettoyage
    config.logger.info("Nettoyage des anciens backups...");
    cleanupOldBackups();
    cleanupTempFiles();

    // 6. Notification de succès
    config.logger.info("Backup terminé avec succès.");
    await sendNotification(
      "Backup Réussi",
      `Le backup complet a été effectué avec succès le ${moment().format("DD/MM/YYYY HH:mm")}.`,
      "success"
    );
  } catch (error) {
    config.logger.error("Erreur lors du processus de backup :", error);
    backupResults.success = false;
    backupResults.errors.push(error.message);

    await sendNotification(
      "Erreur de Backup",
      `Une erreur est survenue lors du backup : ${error.message}`,
      "high"
    );
  }

  return backupResults;
};

module.exports = { performBackup };
