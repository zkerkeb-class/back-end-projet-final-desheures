const jwt = require('jsonwebtoken');
const config = require('../config');

const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token non fourni' });
  }

  const token = authHeader.split(' ')[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Token non fourni' });
  }

  try {
    const decoded = jwt.verify(token, config.env.jwt_secret);

    if (decoded.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Accès refusé. Rôle administrateur requis.' });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = isAuth;
