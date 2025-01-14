const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration de multer pour définir le répertoire de stockage et le nom du fichier
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uplPaths = "../../uploads/"
    const minetype = file.mimetype.split("/")[0];
    const uploadDir = path.join(__dirname, uplPaths.concat(minetype));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.log("minetype : "+minetype);
    console.log("fileMULTER: "+JSON.stringify(file));

    // cb(null, path.join(__dirname, uplPaths)); // Définir le répertoire pour enregistrer les fichiers


    cb(null, uploadDir); // Définir le répertoire pour enregistrer les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Utiliser le nom original du fichier
  }
});

// Middleware de multer
const upload = multer({ storage: storage });

module.exports = upload;
