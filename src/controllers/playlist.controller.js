const Playlist = require("../models/Playlist");

module.exports = {
  createPlaylist: async (req, res) => {
    try {
      const playlist = new Playlist(req.body);
      const savedPlaylist = await playlist.save();
      res.status(201).json(savedPlaylist);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création de la playlist", error });
    }
  },

  getAllPlaylists: async (req, res) => {
    try {
      const playlists = await Playlist.find().populate(
        "tracks",
        "title duration"
      );
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
      const playlist = await Playlist.findById(req.params.id).populate(
        "tracks",
        "title duration"
      );
      if (!playlist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }
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
      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate("tracks", "title duration");
      if (!updatedPlaylist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }
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
      const deletedPlaylist = await Playlist.findByIdAndDelete(req.params.id);
      if (!deletedPlaylist) {
        return res.status(404).json({ message: "Playlist non trouvée" });
      }
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
