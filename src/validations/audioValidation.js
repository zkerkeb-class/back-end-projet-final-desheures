const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const audioValidationRules = () => {
  return [
    body("title")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ max: 200 })
      .withMessage("Le titre ne doit pas dépasser 200 caractères"),

    body("artist").optional({ values: "falsy" }).trim(),

    body("album").optional({ values: "falsy" }).trim(),

    body("duration")
      .optional({ values: "falsy" })
      .isInt({ min: 0 })
      .withMessage("La durée doit être un nombre positif"),

    body("lyrics")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Les paroles ne doivent pas dépasser 5000 caractères"),

    body("tempo")
      .optional({ values: "falsy" })
      .isFloat({ min: 0, max: 300 })
      .withMessage("Le tempo doit être compris entre 0 et 300"),

    body("mood")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ max: 50 })
      .withMessage("L'humeur ne doit pas dépasser 50 caractères"),

    body("genres")
      .optional({ values: "falsy" })
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

    body("popularity")
      .optional({ values: "falsy" })
      .isInt({ min: 0, max: 100 })
      .withMessage("La popularité doit être comprise entre 0 et 100"),

    body("releaseDate")
      .optional({ values: "falsy" })
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
