const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");
const { monitorMongoQuery } = require("../utils/metrics/metrics");

module.exports = {
  // Connexion utilisateur
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      if (email !== "admin@desheures.com") {
        return res
          .status(403)
          .json({ message: "Seul l'administrateur peut se connecter." });
      }

      let adminUser = await monitorMongoQuery('find', 'User', () => User.findOne({ email }).exec());

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(config.env.admin_password, 10);
        adminUser = new User({
          username: "Admin",
          email: "admin@desheures.com",
          password: hashedPassword,
          role: "admin"
        });

        await adminUser.save();
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        adminUser.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }
      req.session.user = {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      };

      const token = jwt.sign(
        req.session.user,
        config.env.jwt_secret,
        { expiresIn: "1h" }
      );

      

      res.status(200).json({ message: "Connexion réussie.", token });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur.", error });
    }
  },

  getCurrentUser: (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Utilisateur non connecté." });
    }

    return res.status(200).json({
      message: "Utilisateur connecté.",
      user: req.session.user
    });
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erreur lors de la déconnexion." });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Déconnexion réussie." });
    });
  }
};
