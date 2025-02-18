const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const audioValidationRules = () => {
  return [
    // Titre
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Le titre est requis")
      .isLength({ max: 200 })
      .withMessage("Le titre ne doit pas dépasser 200 caractères"),

    // Artiste
    body("artist")
      .notEmpty()
      .withMessage("L'artiste est requis")
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("ID artiste invalide");
        }
        return true;
      }),

    // Album
    body("album")
      .optional()
      .custom((value) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("ID album invalide");
        }
        return true;
      }),

    // Durée
    body("duration")
      .notEmpty()
      .withMessage("La durée est requise")
      .isInt({ min: 0 })
      .withMessage("La durée doit être un nombre positif"),

    // URL de l'audio
    body("audioUrl")
      .notEmpty()
      .withMessage("L'URL de l'audio est requise")
      .isURL()
      .withMessage("L'URL de l'audio doit être valide"),

    // Paroles
    body("lyrics")
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Les paroles ne doivent pas dépasser 5000 caractères"),

    // Tempo
    body("tempo")
      .optional()
      .isFloat({ min: 0, max: 300 })
      .withMessage("Le tempo doit être compris entre 0 et 300"),

    // Humeur
    body("mood")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("L'humeur ne doit pas dépasser 50 caractères"),

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

    // Popularité
    body("popularity")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("La popularité doit être comprise entre 0 et 100"),

    // Date de sortie
    body("releaseDate")
      .optional()
      .isISO8601()
      .withMessage("La date de sortie doit être une date valide")
  ];
};

const validateAudioId = () => {
  return [
    param("id").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID audio invalide");
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
  audioValidationRules,
  validateAudioId,
  validate
};
