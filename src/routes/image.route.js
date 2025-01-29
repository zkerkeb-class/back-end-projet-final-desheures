const express = require("express");
const router = express.Router();
const imageController = require("../controllers/image.controller");
// const middlewares = require("../middlewares/");
// const multer = require("../middlewares/multer");
const multer = require("multer");

router.use(express.json({ limit: "50mb" })); // Ajustez la limite si nécessaire
router.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configurer Multer pour stocker les fichiers en mémoire
const upload = multer({ storage: multer.memoryStorage() });
router.post("/convert", upload.single("file"), imageController.convertImage);

module.exports = router;