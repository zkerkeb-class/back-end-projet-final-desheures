const express = require("express");
const router = express.Router();
const imageController = require("../controllers/image.controller");
// const middlewares = require("../middlewares/");
// const multer = require("../middlewares/multer");
const multer = require("multer");

router.use(express.json({ limit: "50mb" }));
router.use(express.urlencoded({ limit: "50mb", extended: true }));

const upload = multer({ storage: multer.memoryStorage() });
router.post("/convert", upload.single("file"), imageController.convertImage);

module.exports = router;
