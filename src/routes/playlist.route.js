const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlist.controller");

/**
 * @swagger
 * tags:
 *   name: Playlist
 *   description: Gestion des playlists
 */

/**
 * @swagger
 * /api/playlist:
 *   get:
 *     summary: Récupérer toutes les playlist
 *     tags: [Playlist]
 *     responses:
 *       200:
 *         description: Liste des playlist récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Playlist'
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/playlist/{id}:
 *   get:
 *     summary: Récupérer une playlist par son ID
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la playlist
 *     responses:
 *       200:
 *         description: Playlist récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       404:
 *         description: Playlist non trouvée.
 *       500:
 *         description: Erreur serveur.
 */

/**
 * @swagger
 * /api/playlist:
 *   post:
 *     summary: Créer une nouvelle playlist
 *     tags: [Playlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
 *     responses:
 *       201:
 *         description: Playlist créée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       400:
 *         description: Erreur de validation des données.
 */

/**
 * @swagger
 * /api/playlist/{id}:
 *   put:
 *     summary: Mettre à jour une playlist par son ID
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
 *     responses:
 *       200:
 *         description: Playlist mise à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Playlist'
 *       404:
 *         description: Playlist non trouvée.
 *       400:
 *         description: Erreur de validation des données.
 */

/**
 * @swagger
 * /api/playlist/{id}/addTrack:
 *   put:
 *     summary: Ajouter une piste à une playlist
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackId:
 *                 type: string
 *                 description: ID de la piste à ajouter
 *     responses:
 *       200:
 *         description: Piste ajoutée avec succès.
 *       404:
 *         description: Playlist ou piste non trouvée.
 *       400:
 *         description: Données invalides.
 */

/**
 * @swagger
 * /api/playlist/{id}/removeTrack:
 *   put:
 *     summary: Supprimer une piste d'une playlist
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackId:
 *                 type: string
 *                 description: ID de la piste à supprimer
 *     responses:
 *       200:
 *         description: Piste supprimée avec succès.
 *       404:
 *         description: Playlist ou piste non trouvée.
 *       400:
 *         description: Données invalides.
 */
/**
 * @swagger
 * /api/playlist/{id}:
 *   delete:
 *     summary: Supprimer une playlist par son ID
 *     tags: [Playlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la playlist
 *     responses:
 *       200:
 *         description: Playlist supprimée avec succès.
 *       404:
 *         description: Playlist non trouvée.
 *       500:
 *         description: Erreur serveur.
 */

router.get("/", playlistController.getAllPlaylists);
router.get("/:id", playlistController.getPlaylistById);
router.post("/", playlistController.createPlaylist);
router.put("/:id", playlistController.updatePlaylist);
router.put("/:id/addTrack", playlistController.addTrackToPlaylist);
router.put("/:id/removeTrack", playlistController.removeTrackFromPlaylist);
router.delete("/:id", playlistController.deletePlaylist);

module.exports = router;
