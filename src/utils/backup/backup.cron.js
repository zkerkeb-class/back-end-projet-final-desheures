const cron = require("node-cron");
const { performBackup } = require("./performBackup");
const config = require("../../config");

cron.schedule("55 8 * * *", async () => {
  config.logger.info("✅ Démarrage du backup planifié");

  try {
    const result = await performBackup();

    if (result.success) {
      config.logger.info("✅ Backup planifié terminé avec succès");
    } else {
      config.logger.error("❌ Erreurs lors du backup planifié:", result.errors);
    }
  } catch (error) {
    config.logger.error("❌ Erreur critique lors du backup planifié:", error);
  }
});

module.exports = {
  startScheduledBackups: () => {
    config.logger.info("✅ Planification des backups automatiques activée");
  }
};
