const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artist.controller');
const middlewares = require('../middlewares/');

/**
 * @swagger
 * tags:
 *   name: Artists
 *   description: Gestion des artistes
 */

/**
 * @swagger
 * /api/artist:
 *   post:
 *     summary: Créer un nouvel artiste
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Artist'
 *     responses:
 *       201:
 *         description: Artiste créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       400:
 *         description: Erreur lors de la création
 */

/**
 * @swagger
 * /api/artist:
 *   get:
 *     summary: Récupérer la liste de tous les artistes
 *     tags: [Artists]
 *     responses:
 *       200:
 *         description: Liste des artistes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 *       500:
 *         description: Erreur lors de la récupération des artistes
 */

/**
 * @swagger
 * /api/artist/{id}:
 *   get:
 *     summary: Récupérer un artiste par son ID
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'artiste
 *     responses:
 *       200:
 *         description: Artiste récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       404:
 *         description: Artiste non trouvé
 *       500:
 *         description: Erreur lors de la récupération
 */

/**
 * @swagger
 * /api/artist/{id}:
 *   put:
 *     summary: Mettre à jour un artiste
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'artiste
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Artist'
 *     responses:
 *       200:
 *         description: Artiste mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artist'
 *       404:
 *         description: Artiste non trouvé
 *       400:
 *         description: Erreur lors de la mise à jour
 */

/**
 * @swagger
 * /api/artist/{id}:
 *   delete:
 *     summary: Supprimer un artiste
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'artiste
 *     responses:
 *       200:
 *         description: Artiste supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 artist:
 *                   $ref: '#/components/schemas/Artist'
 *       404:
 *         description: Artiste non trouvé
 *       500:
 *         description: Erreur lors de la suppression
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Artist:
 *       type: object
 *       required:
 *         - name
 *         - genre
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de l'artiste
 *         name:
 *           type: string
 *           description: Nom de l'artiste
 *         genre:
 *           type: string
 *           description: Genre musical de l'artiste
 *         bio:
 *           type: string
 *           description: Biographie de l'artiste
 *       example:
 *         id: 6372c6724c7e9a1f789345ef
 *         name: John Doe
 *         genre: Rock
 *         bio: Un artiste de rock célèbre
 */

router.get('/', artistController.getAllArtists);
router.get('/:id', artistController.getArtistById);
router.post('/', middlewares.isAuth, artistController.createArtist);
router.put('/:id', middlewares.isAuth, artistController.updateArtist);
router.delete('/:id', middlewares.isAuth, artistController.deleteArtist);

module.exports = router;
