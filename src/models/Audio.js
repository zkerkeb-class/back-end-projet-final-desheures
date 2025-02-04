
const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Audio:
 *       type: object
 *       required:
 *         - title
 *         - artist
 *         - duration
 *         - audioUrl
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique de la piste audio.
 *         title:
 *           type: string
 *           description: Titre de la piste audio.
 *         artist:
 *           type: string
 *           description: ID de l'artiste de la piste.
 *         album:
 *           type: string
 *           description: ID de l'album contenant la piste.
 *         duration:
 *           type: number
 *           description: Durée de la piste en secondes.
 *         audioUrl:
 *           type: string
 *           description: URL de la piste audio.
 *         lyrics:
 *           type: string
 *           description: Paroles de la piste.
 *         tempo:
 *           type: number
 *           description: Tempo de la piste (BPM).
 *         mood:
 *           type: string
 *           description: Ambiance ou humeur de la piste.
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           description: Genres musicaux de la piste.
 *         popularity:
 *           type: number
 *           description: Popularité de la piste audio.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de la piste audio.
 *       example:
 *         id: "64a7f8e5b1e2c0001a2d3e54"
 *         title: "Summer Breeze"
 *         artist: "64a7f8e5b1e2c0001a2d3e4f"
 *         album: "64a7f8e5b1e2c0001a2d3e51"
 *         duration: 180
 *         audioUrl: "http://example.com/audio.mp3"
 *         lyrics: "Here comes the summer breeze..."
 *         tempo: 120
 *         mood: "Relaxed"
 *         genres: ["Pop", "Chill"]
 *         popularity: 65
 *         createdAt: "2024-11-21T12:34:56Z"
 */

const AudioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album"
  },
  duration: {
    type: Number,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  lyrics: {
    type: String
  },
  tempo: {
    type: Number
  },
  mood: {
    type: String
  },
  genres: {
    type: [String],
    default: []
  },
  popularity: {
    type: Number,
    default: 0
  },
  releaseDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// AudioSchema.pre("find", function (next) {
//   this.start = Date.now();
//   next();
// });

// AudioSchema.post("find", function (docs, next) {
//   const executionTimeMs = Date.now() - this.start;

//   next();
// });

const Audio = mongoose.model("Audio", AudioSchema);

module.exports = Audio;
