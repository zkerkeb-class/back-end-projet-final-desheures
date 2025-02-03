const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique généré automatiquement pour l'utilisateur.
 *         username:
 *           type: string
 *           description: Nom d'utilisateur de l'utilisateur.
 *           example: johndoe
 *         email:
 *           type: string
 *           description: Adresse email de l'utilisateur.
 *           format: email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           description: Mot de passe crypté de l'utilisateur.
 *           example: $2b$10$abcdef123456
 *         role:
 *           type: string
 *           description: Rôle de l'utilisateur dans le système (ex. admin, user, etc.).
 *           example: admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date et heure de création de l'utilisateur.
 *           example: 2024-11-21T10:30:00Z
 */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
    maxlength: 255
  },
  password: {
    type: String,
    maxlength: 255
  },
  role: {
    type: String,
    required: true,
    maxlength: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour calculer le temps d'exécution des requêtes
userSchema.pre("find", function (next) {
  this.start = Date.now(); // Début du chronométrage
  next();
});

userSchema.post("find", function (docs, next) {
  const executionTimeMs = Date.now() - this.start; // Fin du chronométrage
  console.log(`Requête Mongoose 'find' exécutée en ${executionTimeMs} ms`);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
