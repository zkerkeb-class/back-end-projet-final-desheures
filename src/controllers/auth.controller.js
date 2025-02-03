const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");

module.exports = {
  // Connexion utilisateur
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Vérification si l'utilisateur est administrateur
      if (email !== "admin@desheures.com") {
        return res
          .status(403)
          .json({ message: "Seul l'administrateur peut se connecter." });
      }

      // Recherche de l'utilisateur dans la base de données
      let adminUser = await User.findOne({ email });

      if (!adminUser) {
        // Création d'un compte admin si inexistant
        const hashedPassword = await bcrypt.hash(config.env.admin_password, 10);
        adminUser = new User({
          username: "Admin",
          email: "admin@desheures.com",
          password: hashedPassword,
          role: "admin"
        });

        await adminUser.save();
      }

      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }

      // Création du token JWT
      const token = jwt.sign(
        {
          id: adminUser._id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role
        },
        config.env.jwt_secret,
        { expiresIn: "1h" }
      );

      // Stockage des informations utilisateur dans la session
      req.session.user = {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      };

      res.status(200).json({ message: "Connexion réussie.", token });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur.", error });
    }
  },

  // Récupération des informations de l'utilisateur connecté
  getCurrentUser: (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Utilisateur non connecté." });
    }

    return res.status(200).json({
      message: "Utilisateur connecté.",
      user: req.session.user
    });
  },

  // Déconnexion
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion." });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Déconnexion réussie." });
    });
  }
};
