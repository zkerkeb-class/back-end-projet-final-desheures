const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const albumValidationRules = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Le titre est requis")
      .isLength({ max: 200 })
      .withMessage("Le titre ne doit pas dépasser 200 caractères"),

    body("artist")
      .notEmpty()
      .withMessage("L'artiste est requis")
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("ID artiste invalide");
        }
        return true;
      }),

    body("releaseDate")
      .optional()
      .isISO8601()
      .withMessage("La date de sortie doit être une date valide"),

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

    body("coverUrl")
      .optional()
      .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
      .withMessage(
        "Le fichier doit être une image (jpg, jpeg, png, gif, webp)"
      ),

    body("tracks")
      .optional()
      .isArray()
      .withMessage("Les pistes doivent être un tableau")
      .custom((value) => {
        if (
          value &&
          value.some((track) => !mongoose.Types.ObjectId.isValid(track))
        ) {
          throw new Error("Les IDs des pistes doivent être valides");
        }
        return true;
      }),

    body("popularity")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("La popularité doit être comprise entre 0 et 100")
  ];
};

const validateAlbumId = () => {
  return [
    param("id").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID album invalide");
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
  albumValidationRules,
  validateAlbumId,
  validate
};
