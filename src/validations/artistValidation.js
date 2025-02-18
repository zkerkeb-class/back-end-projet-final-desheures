const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const artistValidationRules = () => {
  return [
    // Nom
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Le nom est requis")
      .isLength({ max: 200 })
      .withMessage("Le nom ne doit pas dépasser 200 caractères"),

    // Prononciation du nom
    body("namePhonetic")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("La prononciation ne doit pas dépasser 200 caractères"),

    // Genres
    body("genres")
      .optional()
      .isArray()
      .withMessage("Les genres doivent être un tableau")
      .custom((value) => {
        if (value && value.some((genre) => typeof genre !== "string")) {
          throw new Error(
            "Tous les genres doivent être des chaînes de caractères"
          );
        }
        return true;
      }),

    // Biographie
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("La biographie ne doit pas dépasser 2000 caractères"),

    // URL de l'image
    body("imageUrl")
      .optional()
      .custom((value) => {
        if (value && !value.startsWith("/uploads/")) {
          throw new Error("Le chemin de l'image doit commencer par /uploads/");
        }
        return true;
      })
      .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
      .withMessage(
        "Le fichier doit être une image (jpg, jpeg, png, gif, webp)"
      ),

    // Liens sociaux
    body("socialLinks")
      .optional()
      .isArray()
      .withMessage("Les liens sociaux doivent être un tableau"),

    body("socialLinks.*.platform")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("La plateforme est requise")
      .isLength({ max: 50 })
      .withMessage(
        "Le nom de la plateforme ne doit pas dépasser 50 caractères"
      ),

    body("socialLinks.*.url")
      .optional()
      .isURL()
      .withMessage("L'URL du réseau social doit être valide"),

    // Popularité
    body("popularity")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("La popularité doit être comprise entre 0 et 100"),

    // Albums
    body("albums")
      .optional()
      .isArray()
      .withMessage("Les albums doivent être un tableau")
      .custom((value) => {
        if (
          value &&
          value.some((album) => !mongoose.Types.ObjectId.isValid(album))
        ) {
          throw new Error("Les IDs des albums doivent être valides");
        }
        return true;
      })
  ];
};

const validateArtistId = () => {
  return [
    param("id").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID artiste invalide");
      }
      return true;
    })
  ];
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
  artistValidationRules,
  validateArtistId,
  validate
};
