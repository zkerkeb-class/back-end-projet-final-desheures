const multer = require("multer");
const path = require("path");

// Configuration de multer pour définir le répertoire de stockage et le nom du fichier
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads")); // Définir le répertoire pour enregistrer les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Utiliser le nom original du fichier
  }
});

// Middleware de multer
const upload = multer({ storage: storage });

module.exports = upload;
