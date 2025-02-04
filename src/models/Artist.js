
const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Artist:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique de l'artiste.
 *         name:
 *           type: string
 *           description: Nom de l'artiste.
 *         namePhonetic:
 *           type: string
 *           description: Représentation phonétique du nom pour la recherche.
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des genres musicaux associés à l'artiste.
 *         bio:
 *           type: string
 *           description: Biographie de l'artiste.
 *         imageUrl:
 *           type: string
 *           description: URL de l'image de l'artiste.
 *         socialLinks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: Nom de la plateforme.
 *               url:
 *                 type: string
 *                 description: Lien vers le profil de l'artiste.
 *         popularity:
 *           type: number
 *           description: Popularité de l'artiste (basée sur les écoutes).
 *         albums:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des IDs des albums de l'artiste.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'artiste.
 *       example:
 *         id: "64a7f8e5b1e2c0001a2d3e4f"
 *         name: "John Doe"
 *         namePhonetic: "JHN D"
 *         genres: ["Pop", "Rock"]
 *         bio: "Un artiste célèbre dans le monde entier."
 *         imageUrl: "http://example.com/image.jpg"
 *         socialLinks:
 *           - platform: "Instagram"
 *             url: "http://instagram.com/johndoe"
 *           - platform: "Twitter"
 *             url: "http://twitter.com/johndoe"
 *         popularity: 95
 *         albums: ["64a7f8e5b1e2c0001a2d3e50"]
 *         createdAt: "2024-11-21T12:34:56Z"
 */

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  namePhonetic: {
    type: String
  },
  genres: {
    type: [String],
    default: []
  },
  bio: {
    type: String
  },
  imageUrl: {
    type: String
  },
  socialLinks: [
    {
      platform: {
        type: String
      },
      url: {
        type: String
      }
    }
  ],
  popularity: {
    type: Number,
    default: 0
  },
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album"
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// ArtistSchema.pre("find", function (next) {
//   this.start = Date.now();
//   next();
// });

// ArtistSchema.post("find", function (docs, next) {
//   const executionTimeMs = Date.now() - this.start;

//   next();
// });

const Artist = mongoose.model("Artist", ArtistSchema);

module.exports = Artist;
