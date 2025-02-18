const { body, param, validationResult } = require("express-validator");

const userValidationRules = () => {
  return [
    // Username
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Le nom d'utilisateur est requis")
      .isLength({ max: 50 })
      .withMessage("Le nom d'utilisateur ne doit pas dépasser 50 caractères"),

    // Email
    body("email")
      .trim()
      .notEmpty()
      .withMessage("L'email est requis")
      .isEmail()
      .withMessage("L'email doit être valide")
      .isLength({ max: 255 })
      .withMessage("L'email ne doit pas dépasser 255 caractères")
      .normalizeEmail(),

    // Password
    body("password")
      .optional()
      .isLength({ min: 6, max: 255 })
      .withMessage("Le mot de passe doit faire entre 6 et 255 caractères")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)
      .withMessage(
        "Le mot de passe doit contenir au moins une lettre et un chiffre"
      ),

    // Role
    body("role")
      .trim()
      .notEmpty()
      .withMessage("Le rôle est requis")
      .isLength({ max: 50 })
      .withMessage("Le rôle ne doit pas dépasser 50 caractères")
      .isIn(["admin", "user", "artist"])
      .withMessage("Le rôle doit être admin, user ou artist")
  ];
};

const validateUserId = () => {
  return [param("id").isMongoId().withMessage("ID utilisateur invalide")];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Erreur de validation",
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  userValidationRules,
  validateUserId,
  validate
};
