const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Album:
 *       type: object
 *       required:
 *         - title
 *         - artist
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique de l'album.
 *         title:
 *           type: string
 *           description: Titre de l'album.
 *         artist:
 *           type: string
 *           description: ID de l'artiste associé à l'album.
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: Date de sortie de l'album.
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           description: Genres musicaux de l'album.
 *         coverUrl:
 *           type: string
 *           description: URL de la couverture de l'album.
 *         tracks:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des IDs des pistes audio dans l'album.
 *         trackCount:
 *           type: number
 *           description: Nombre total de pistes dans l'album.
 *         popularity:
 *           type: number
 *           description: Popularité de l'album.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'album.
 *       example:
 *         id: "64a7f8e5b1e2c0001a2d3e51"
 *         title: "Greatest Hits"
 *         artist: "64a7f8e5b1e2c0001a2d3e4f"
 *         releaseDate: "2023-07-01"
 *         genres: ["Pop", "Rock"]
 *         coverUrl: "http://example.com/cover.jpg"
 *         tracks: ["64a7f8e5b1e2c0001a2d3e52", "64a7f8e5b1e2c0001a2d3e53"]
 *         trackCount: 12
 *         popularity: 85
 *         createdAt: "2024-11-21T12:34:56Z"
 */

const AlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  releaseDate: {
    type: Date
  },
  genres: {
    type: [String],
    default: []
  },
  coverUrl: {
    type: String
  },
  tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audio'
    }
  ],
  trackCount: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;
