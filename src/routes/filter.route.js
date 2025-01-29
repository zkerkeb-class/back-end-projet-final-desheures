const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filter.controller");

router.get("/genres", filterController.getAllGenres);
router.get("/artists/genre/:genre", filterController.getArtistsByGenre);

router.get("/albums/artist/:artistId", filterController.getAlbumsByArtist);
router.get("/albums/year/:year", filterController.getAlbumsByYear);
router.get("/albums/genre/:genre", filterController.getAlbumsByGenre);

router.get("/tracks/artist/:artistId", filterController.getTracksByArtist);
router.get("/tracks/album/:albumId", filterController.getTracksByAlbum);
router.get("/tracks/year/:year", filterController.getTracksByYear);
router.get("/tracks/genre/:genre", filterController.getTracksByGenre);
router.get("/tracks/duration/:range", filterController.getTracksByDuration);

module.exports = router;
