const express = require("express");
const router = express.Router();
const sortController = require("../controllers/sort.controller");

router.get(
  "/audios/duration/",
  sortController.getAudiosSortedByDuration
);
router.get("/albums/date", sortController.getAlbumSortedByDate);
router.get("/artists/alphabetical", sortController.getArtistsSortedByAlphabet);
router.get(
  "/playlist/tracks",
  sortController.getPlaylistBySortedByNumberOfTracks
);
router.get("/audios/popularity", sortController.getAudiosSortedByPopularity);
router.get("/albums/popularity", sortController.getAlbumsSortedByPopularity);
router.get("/artists/popularity", sortController.getArtistsSortedByPopularity);
router.get("/albums/tracks", sortController.getAlbumsSortedByNumberOfTracks);
router.get(
  "/audios/alphabetical",
  sortController.getTracksSortedByAlphabetOfTheTitle
);
router.get("/albums/released", sortController.getAlbumsSortedByReleaseDate);
module.exports = router;
