const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;

    if (email !== 'admin@desheures.com') {
      return res
        .status(403)
        .json({ message: 'Seul le super utilisateur peut se connecter.' });
    }

    try {
      let adminUser = await User.findOne({ email });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(config.admin_password, 10);

        adminUser = new User({
          username: 'Admin',
          email: 'admin@desheures.com',
          password: hashedPassword,
          role: 'admin'
        });

        await adminUser.save();
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        adminUser.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }

      const token = jwt.sign(
        { id: adminUser._id, role: adminUser.role },
        config.jwt_secret,
        { expiresIn: '1h' }
      );

      res.status(200).json({ message: 'Connexion réussie.', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
};