const Playlist = require("../models/Playlist");
const config = require("../config");
const { monitorMongoQuery } = require("../utils/metrics/metrics")

const playlistSocketController = {
  getPlaylistByType: async (sessionId, playlistType) => {
    try {
      const playlist = await monitorMongoQuery('findPlaylistByType', 'Playlist', () => {
        Playlist.findOne({
          sessionId,
          playlistType
        })
        .populate("tracks", "title duration imageUrl albumCoverUrl")
        .exec();
      });

      if (!playlist) {
        const defaultName =
          playlistType === "recentlyPlayed"
            ? "Dernières écoutes"
            : "Les plus écoutés";
        const newPlaylist = new Playlist({
          name: defaultName,
          sessionId,
          playlistType,
          tracks: []
        });
        await newPlaylist.save();
        return [];
      }

      if (playlistType === "mostPlayed") {
        return playlist.tracks.map((track) => ({
          ...track.toObject(),
          playCount: playlist.trackPlayCounts.get(track._id.toString()) || 0
        }));
      }

      return playlist.tracks;
    } catch (error) {
      config.logger.error("Erreur getPlaylistByType:", error);
      throw error;
    }
  },

  updatePlaylistByType: async (trackId, sessionId, playlistType) => {
    try {
      let playlist = await monitorMongoQuery('updatePlaylistByType', 'Playlist', () => {
        Playlist.findOne({
          sessionId,
          playlistType
        })
        .exec()
      });

      if (!playlist) {
        const defaultName =
          playlistType === "recentlyPlayed"
            ? "Dernières écoutes"
            : "Les plus écoutés";
        playlist = new Playlist({
          name: defaultName,
          sessionId,
          playlistType,
          tracks: [],
          trackPlayCounts: new Map()
        });
      }

      if (playlistType === "recentlyPlayed") {
        playlist.tracks = playlist.tracks.filter(
          (id) => id.toString() !== trackId.toString()
        );
        playlist.tracks.unshift(trackId);
        playlist.tracks = playlist.tracks.slice(0, 20);
      } else if (playlistType === "mostPlayed") {
        const counts = playlist.trackPlayCounts || new Map();

        const currentCount = (counts.get(trackId.toString()) || 0) + 1;
        counts.set(trackId.toString(), currentCount);
        playlist.trackPlayCounts = counts;

        if (!playlist.tracks.includes(trackId)) {
          playlist.tracks.push(trackId);
        }

        playlist.tracks.sort((a, b) => {
          const countA = counts.get(a.toString()) || 0;
          const countB = counts.get(b.toString()) || 0;
          return countB - countA;
        });

        playlist.tracks = playlist.tracks.slice(0, 20);
        playlist.playCount += 1;
      }

      playlist.lastPlayed = new Date();
      await playlist.save();
      return playlist;
    } catch (error) {
      config.logger.error("Erreur updatePlaylistByType:", error);
      throw error;
    }
  }
};

module.exports = {
  playlistSocketController,
  createPlaylist: async (req, res) => {
    try {
      const { tracks = [] } = req.body;
      const trackCount = tracks.length;
      const playlist = new Playlist({
        ...req.body,
        trackCount
      });
      const savedPlaylist = await monitorMongoQuery('create', 'Playlist', () => playlist.save().exec());


      await config.redis.del("playlists:all");
      res.status(201).json(savedPlaylist);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création de la playlist", error });
    }
  },

  getAllPlaylists: async (req, res) => {
    try {
      const cachedPlaylists = await config.redis.get("playlists:all");

      if (cachedPlaylists) {
        return res.status(200).json(JSON.parse(cachedPlaylists));
      }
      const playlists = await monitorMongoQuery('find', 'Playlist', () => {
        Playlist.find().populate(
          "tracks",
          "title duration"
        ).exec();
      });

      await config.redis.set("playlists:all", JSON.stringify(playlists), {
        EX: 3600
      });

      res.status(200).json(playlists);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des playlists",
        error
      });
    }
  },

  getPlaylistById: async (req, res) => {
    try {

      const cacheKey = `playlists:${req.params.id}`;
      const cachedPlaylist = await config.redis.get(cacheKey);
      if (cachedPlaylist) {
        return res.status(200).json(JSON.parse(cachedPlaylist));
      }
      const playlist = await monitorMongoQuery('findPlaylistById', 'Playlist', () => {
        Playlist.findById(req.params.id)
        .populate(
          "tracks",
          "title duration"
        )
        .exec();
      });

      if (!playlist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }

      await config.redis.set(cacheKey, JSON.stringify(playlist), {
        EX: 3600
      });

      res.status(200).json(playlist);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération de la playlist",
        error
      });
    }
  },

  updatePlaylist: async (req, res) => {
    try {
      const { tracks } = req.body;
      const updatedPlaylist = await monitorMongoQuery('update', 'Playlist', () => {
        Playlist.findByIdAndUpdate(
          req.params.id,
          {
            ...req.body,
            ...(tracks && { trackCount: tracks.length })
          },
          { new: true }
        )
        .populate("tracks", "title duration")
        .exec();
      });
      if (!updatedPlaylist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }

      const cacheKey = `playlists:${req.params.id}`;
      await config.redis.set(cacheKey, JSON.stringify(updatedPlaylist), {
        EX: 3600
      });

      await config.redis.del("playlists:all");

      res.status(200).json(updatedPlaylist);
    } catch (error) {
      res.status(400).json({
        message: "Erreur lors de la mise à jour de la playlist",
        error
      });
    }
  },

  deletePlaylist: async (req, res) => {
    try {
      const deletedPlaylist = await monitorMongoQuery('delete', 'Playlist', () => Playlist.findByIdAndDelete(req.params.id).exec());
      if (!deletedPlaylist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }
      const cacheKey = `playlists:${req.params.id}`;
      await config.redis.del(cacheKey);

      await config.redis.del("playlists:all");
      res.status(200).json({
        message: "Playlist supprimée avec succès",
        playlist: deletedPlaylist
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la suppression de la playlist",
        error
      });
    }
  },

  addTrackToPlaylist: async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }

      const trackId = req.body.trackId;
      if (!trackId) {
        return res.status(400).json({ message: "ID de la piste manquant" });
      }

      if (!playlist.tracks.includes(trackId)) {
        playlist.tracks.push(trackId);
        playlist.trackCount = playlist.tracks.length;
        await playlist.save();
      }

      res.status(200).json(playlist);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de l'ajout de la piste à la playlist",
        error
      });
    }
  },

  removeTrackFromPlaylist: async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }

      const trackId = req.body.trackId;
      if (!trackId) {
        return res.status(400).json({ message: "ID de la piste manquant" });
      }

      playlist.tracks = playlist.tracks.filter(
        (track) => track.toString() !== trackId
      );
      playlist.trackCount = playlist.tracks.length;
      await playlist.save();

      res.status(200).json(playlist);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la suppression de la piste de la playlist",
        error
      });
    }
  }
};
