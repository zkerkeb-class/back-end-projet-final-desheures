const express = require("express");
const router = express.Router();
const albumController = require("../controllers/album.controller");
const middlewares = require("../middlewares/");
const {
  album: { albumValidationRules, validateAlbumId, validate }
} = require("../validations");
/**
 * @swagger
 * tags:
 *   name: Album
 *   description: Gestion des albums
 */

/**
 * @swagger
 * /api/album:
 *   get:
 *     summary: Récupérer tous les albums
 *     tags: [Album]
 *     responses:
 *       200:
 *         description: Liste des albums récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/album/{id}:
 *   get:
 *     summary: Récupérer un album par son ID
 *     tags: [Album]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'album
 *     responses:
 *       200:
 *         description: Album récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       404:
 *         description: Album non trouvé.
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/album:
 *   post:
 *     summary: Créer un nouvel album
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Album'
 *     responses:
 *       201:
 *         description: Album créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       400:
 *         description: Erreur de validation des données.
 *       401:
 *         description: Non autorisé.
 */

/**
 * @swagger
 * /api/album/{id}:
 *   put:
 *     summary: Mettre à jour un album par son ID
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'album
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Album'
 *     responses:
 *       200:
 *         description: Album mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Album'
 *       404:
 *         description: Album non trouvé.
 *       400:
 *         description: Erreur de validation des données.
 *       401:
 *         description: Non autorisé.
 */

/**
 * @swagger
 * /api/album/{id}:
 *   delete:
 *     summary: Supprimer un album par son ID
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'album
 *     responses:
 *       200:
 *         description: Album supprimé avec succès.
 *       404:
 *         description: Album non trouvé.
 *       401:
 *         description: Non autorisé.
 *       500:
 *         description: Erreur serveur.
 */

router.get("/", albumController.getAllAlbums);

router.get("/:id", validateAlbumId(), validate, albumController.getAlbumById);

router.post(
  "/",
  middlewares.isAuth,
  albumValidationRules(),
  validate,
  albumController.createAlbum
);

router.put(
  "/:id",
  middlewares.isAuth,
  validateAlbumId(),
  albumValidationRules(),
  validate,
  albumController.updateAlbum
);
router.delete(
  "/:id",
  middlewares.isAuth,
  validateAlbumId(),
  validate,
  albumController.deleteAlbum
);

module.exports = router;
