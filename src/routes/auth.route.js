const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecte l'utilisateur admin.
 *     tags:
 *       - Authentification de l'admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'administrateur.
 *                 example: admin@desheures.com
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'administrateur.
 *                 example: defaultPassword123
 *     responses:
 *       200:
 *         description: Connexion réussie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connexion réussie.
 *                 token:
 *                   type: string
 *                   description: Le token JWT pour l'administrateur.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Mot de passe incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mot de passe incorrect.
 *       403:
 *         description: Email non autorisé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Seul le super utilisateur peut se connecter.
 */
router.post('/login', authController.login);

module.exports = router;
