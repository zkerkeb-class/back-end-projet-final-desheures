const path = require("path");

module.exports = {
  // Chemins des dossiers
  paths: {
    backup: path.join(__dirname, "../../../backups"),
    temp: path.join(__dirname, "../../../temp"),
    media: {
      uploads: path.join(__dirname, "../../../uploads")
    }
  },

  // Configuration des notifications
  notification: {
    ntfyUrl: process.env.NTFY_URL || "https://ntfy.sh/backup_desheures_alert"
  },

  // Politique de rétention des backups
  retention: {
    daily: 7, // Nombre de jours à garder
    weekly: 4 // Nombre de semaines à garder
  },

  mongodb: {
    database:
      process.env.MONGO_DB_NAME ||
      "mongodb://admin:password123@localhost:28018/?authSource=admin",
    testDatabase:
      "mongodb://admin:password123@localhost:28018/?authSource=admin"
  },

  // Format des timestamps
  timeFormat: "YYYYMMDD_HHmmss",

  // Format des dossiers de date
  folderFormat: "YYYY-MM"
};
