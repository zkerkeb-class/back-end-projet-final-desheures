const fetch = require("node-fetch");
const config = require("../../config");
const backupConfig = require("./backup.config");

const sendNotification = async (title, message, priority = 3) => {
  try {
    if (!backupConfig.notification.ntfyUrl) {
      config.logger.error(
        "❌ NTFY_URL non défini ou notifications désactivées."
      );
      return false;
    }

    const validPriorities = ["1", "3", "5"];
    const priorityValue = validPriorities.includes(String(priority))
      ? String(priority)
      : "3";

    const response = await fetch(backupConfig.notification.ntfyUrl, {
      method: "POST",
      headers: {
        "X-Title": title,
        "X-Priority": priorityValue,
        "Content-Type": "text/plain"
      },
      body: message
    });

    const responseText = await response.text();

    if (!response.ok) {
      config.logger.error(
        `❌ Erreur lors de l'envoi de la notification : ${response.status} ${response.statusText} - ${responseText}`
      );
      return false;
    }

    config.logger.info("✅ Notification envoyée avec succès.");
    return true;
  } catch (error) {
    config.logger.error(
      "❌ Erreur lors de l'envoi de la notification :",
      error
    );
    return false;
  }
};

module.exports = { sendNotification };
