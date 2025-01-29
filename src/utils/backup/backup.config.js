const path = require("path");
const config = require("../../config");
module.exports = {
  paths: {
    backup: path.join(__dirname, "../../../backups"),
    temp: path.join(__dirname, "../../../temp"),
    media: {
      uploads: path.join(__dirname, "../../../uploads")
    }
  },

  notification: {
    ntfyUrl: process.env.NTFY_URL || "https://ntfy.sh/backup_desheures_alert"
  },

  retention: {
    daily: 7,
    weekly: 4
  },

  mongodb: {
    database: config.env.mongo_uri,
    testDatabase: config.env.mongo_uri
  },

  timeFormat: "YYYYMMDD_HHmmss",

  folderFormat: "YYYY-MM"
};
