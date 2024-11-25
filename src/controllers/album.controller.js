const Album = require('../models/Album');

module.exports = {
  createAlbum: async (req, res) => {
    try {
      const album = new Album(req.body);
      const savedAlbum = await album.save();
      res.status(201).json(savedAlbum);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la création de l'album", error });
    }
  },

  getAllAlbums: async (req, res) => {
    try {
      const albums = await Album.find().populate('artist').populate('tracks');
      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: 'Erreur lors de la récupération des albums',
        error
      });
    }
  },

  getAlbumById: async (req, res) => {
    try {
      const album = await Album.findById(req.params.id)
        .populate('artist')
        .populate('tracks');
      if (!album) {
        return res.status(404).json({ message: 'Album non trouvé' });
      }
      res.status(200).json(album);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération de l'album",
        error
      });
    }
  },

  updateAlbum: async (req, res) => {
    try {
      const updatedAlbum = await Album.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )
        .populate('artist')
        .populate('tracks');
      if (!updatedAlbum) {
        return res.status(404).json({ message: 'Album non trouvé' });
      }
      res.status(200).json(updatedAlbum);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Erreur lors de la mise à jour de l'album", error });
    }
  },

  deleteAlbum: async (req, res) => {
    try {
      const deletedAlbum = await Album.findByIdAndDelete(req.params.id);
      if (!deletedAlbum) {
        return res.status(404).json({ message: 'Album non trouvé' });
      }
      res.status(200).json({
        message: 'Album supprimé avec succès',
        album: deletedAlbum
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'album", error });
    }
  }
};
