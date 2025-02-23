const express = require("express");
const router = express.Router();
const audioController = require("../controllers/audio.controller");
const middlewares = require("../middlewares/");
const multer = require("multer");
const {
  audio: { audioValidationRules, validateAudioId, validate }
} = require("../validations");
router.use(express.json({ limit: "50mb" })); // Ajustez la limite si nécessaire
router.use(express.urlencoded({ limit: "50mb", extended: true }));

/**
 * @swagger
 * tags:
 *   name: Audio
 *   description: Gestion des audios
 */

/**
 * @swagger
 * tags:
 *   name: Audio
 *   description: Gestion des audios
 */

/**
 * @swagger
 * /api/audio:
 *   get:
 *     summary: Récupérer tous les audios
 *     tags: [Audio]
 *     responses:
 *       200:
 *         description: Liste des audios récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/audio/{id}:
 *   get:
 *     summary: Récupérer un audio par son ID
 *     tags: [Audio]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'audio
 *     responses:
 *       200:
 *         description: Audio récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Audio'
 *       404:
 *         description: Audio non trouvé.
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/audio:
 *   post:
 *     summary: Créer un nouvel audio
 *     tags: [Audio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Audio'
 *     responses:
 *       201:
 *         description: Audio créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Audio'
 *       400:
 *         description: Erreur de validation des données.
 *       401:
 *         description: Non autorisé.
 */

/**
 * @swagger
 * /api/audio/{id}:
 *   put:
 *     summary: Mettre à jour un audio par son ID
 *     tags: [Audio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'audio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Audio'
 *     responses:
 *       200:
 *         description: Audio mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Audio'
 *       404:
 *         description: Audio non trouvé.
 *       400:
 *         description: Erreur de validation des données.
 *       401:
 *         description: Non autorisé.
 */

/**
 * @swagger
 * /api/audio/{id}:
 *   delete:
 *     summary: Supprimer un audio par son ID
 *     tags: [Audio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'audio
 *     responses:
 *       200:
 *         description: Audio supprimé avec succès.
 *       404:
 *         description: Audio non trouvé.
 *       401:
 *         description: Non autorisé.
 *       500:
 *         description: Erreur serveur.
 */

const upload = multer({ storage: multer.memoryStorage() });
router.get("/", audioController.getAllAudios);
router.get("/:id", validateAudioId(), validate, audioController.getAudioById);
router.post(
  "/",
  upload.single("file"),
  audioValidationRules(),
  validate,
  middlewares.isAuth,
  audioController.createAudio
);
router.put(
  "/:id",
  validateAudioId(),
  audioValidationRules(),
  validate,
  middlewares.isAuth,
  audioController.updateAudio
);
router.delete(
  "/:id",
  validateAudioId(),
  validate,
  middlewares.isAuth,
  audioController.deleteAudio
);

// Configurer Multer pour stocker le fichier en mémoire
router.post("/convert", upload.single("file"), audioController.convertAudio);
module.exports = router;
