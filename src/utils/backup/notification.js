const fetch = require("node-fetch");
const config = require("../../config");
const backupConfig = require("./backup.config");

const sendNotification = async (title, message, priority = "default") => {
  config.logger.info(
    `Tentative d'envoi de notification : Title="${title}", Priority="${priority}"`
  );

  try {
    if (!backupConfig.notification.ntfyUrl) {
      config.logger.error("NTFY_URL non défini ou notifications désactivées.");
      return false;
    }

    const response = await fetch(backupConfig.notification.ntfyUrl, {
      method: "POST",
      headers: {
        Title: title,
        Priority: priority,
        "Content-Type": "text/plain"
      },
      body: message
    });

    if (!response.ok) {
      config.logger.error(
        `Erreur lors de l'envoi de la notification : ${response.status} ${response.statusText}`
      );
      return false;
    }

    config.logger.info("Notification envoyée avec succès.");
    return true;
  } catch (error) {
    config.logger.error("Erreur lors de l'envoi de la notification :", error);
    return false;
  }
};

module.exports = { sendNotification };
