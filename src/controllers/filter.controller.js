const Album = require("../models/Album");
const Audio = require("../models/Audio");
const Artist = require("../models/Artist");

module.exports = {
  // Filtrer les albums par artiste
  getAlbumsByArtist: async (req, res) => {
    try {
      const { artistId } = req.params;
      const albums = await Album.find({ artist: artistId });
      if (albums.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun album trouvé pour cet artiste" });
      }
      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des albums",
        error
      });
    }
  },

  // Filtrer les pistes audio par artiste
  getTracksByArtist: async (req, res) => {
    try {
      const { artistId } = req.params;
      const tracks = await Audio.find({ artist: artistId });
      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cet artiste" });
      }
      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio",
        error
      });
    }
  },

  getTracksByAlbum: async (req, res) => {
    try {
      const { albumId } = req.params;
      const tracks = await Audio.find({ album: albumId });
      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cet album" });
      }
      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio par album",
        error
      });
    }
  },

  getArtistsByGenre: async (req, res) => {
    try {
      const { genre } = req.params;
      const artists = await Artist.find({ genres: genre });
      if (artists.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun artiste trouvé pour ce genre" });
      }
      res.status(200).json(artists);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des artistes par genre",
        error
      });
    }
  },

  // Filtrer les albums par genre
  getAlbumsByGenre: async (req, res) => {
    try {
      const { genre } = req.params;
      const albums = await Album.find({ genres: genre });
      if (albums.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun album trouvé pour ce genre" });
      }
      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des albums par genre",
        error
      });
    }
  },

  getTracksByGenre: async (req, res) => {
    try {
      const { genre } = req.params;
      const tracks = await Audio.find({ genres: genre });
      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour ce genre" });
      }
      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio par genre",
        error
      });
    }
  },

  getAlbumsByYear: async (req, res) => {
    try {
      const { year } = req.params;
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const albums = await Album.find({
        releaseDate: { $gte: startOfYear, $lte: endOfYear }
      });

      if (albums.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun album trouvé pour cette année" });
      }
      res.status(200).json(albums);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des albums par année",
        error
      });
    }
  },

  getTracksByYear: async (req, res) => {
    try {
      const { year } = req.params;
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const tracks = await Audio.find({
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      });

      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cette année" });
      }
      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes audio par année",
        error
      });
    }
  },
  getTracksByDuration: async (req, res) => {
    try {
      const { range } = req.params;

      let durationFilter = {};
      if (range === "short") {
        durationFilter = { duration: { $lt: 180 } };
      } else if (range === "medium") {
        durationFilter = { duration: { $gte: 180, $lte: 300 } };
      } else if (range === "long") {
        durationFilter = { duration: { $gt: 300 } };
      } else {
        return res.status(400).json({ message: "Plage de durée invalide" });
      }

      const tracks = await Audio.find(durationFilter);

      if (tracks.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucune piste trouvée pour cette plage de durée" });
      }

      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des pistes par durée",
        error
      });
    }
  }
};
