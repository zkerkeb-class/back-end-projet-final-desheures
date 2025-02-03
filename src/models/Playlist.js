const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       required:
 *         - name
 *         - tracks
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique de la playlist.
 *         name:
 *           type: string
 *           description: Nom de la playlist.
 *         description:
 *           type: string
 *           description: Description de la playlist.
 *         tracks:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des IDs des pistes audio dans la playlist.
 *         coverUrl:
 *           type: string
 *           description: URL de la couverture de la playlist.
 *         trackCount:
 *           type: number
 *           description: Nombre de pistes dans la playlist.
 *         totalDuration:
 *           type: number
 *           description: Durée totale de la playlist en secondes.
 *         popularity:
 *           type: number
 *           description: Popularité de la playlist.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de la playlist.
 *       example:
 *         id: "64a7f8e5b1e2c0001a2d3e55"
 *         name: "Chill Vibes"
 *         description: "Relax and enjoy the music."
 *         tracks: ["64a7f8e5b1e2c0001a2d3e54", "64a7f8e5b1e2c0001a2d3e56"]
 *         coverUrl: "http://example.com/playlist-cover.jpg"
 *         trackCount: 20
 *         totalDuration: 3600
 *         popularity: 70
 *         createdAt: "2024-11-21T12:34:56Z"
 */

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audio",
      required: true
    }
  ],
  coverUrl: {
    type: String
  },
  trackCount: {
    type: Number,
    default: 0
  },
  totalDuration: {
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
  },
  // Nouveaux champs
  playlistType: {
    type: String,
    enum: ["normal", "recentlyPlayed", "mostPlayed"],
    default: "normal"
  },
  sessionId: {
    type: String // Pour stocker l'ID de session
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  },
  playCount: {
    type: Number,
    default: 0
  },
  trackPlayCounts: {
    type: Map,
    of: Number,
    default: new Map()
  }
});
PlaylistSchema.pre("save", async function (next) {
  if (this.isModified("tracks")) {
    this.trackCount = this.tracks.length;
  }
  next();
});

PlaylistSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.tracks) {
    const trackCount = update.tracks.length;
    this.setUpdate({ ...update, trackCount });
  }
  next();
});

const Playlist = mongoose.model("Playlist", PlaylistSchema);

module.exports = Playlist;
