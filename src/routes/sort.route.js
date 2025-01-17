const express = require("express");
const router = express.Router();
const sortController = require("../controllers/sort.controller");

router.get("/audios/duration/asc", sortController.getAudiosSortedByDurationAsc);
router.get(
  "/audios/duration/desc",
  sortController.getAudiosSortedByDurationDesc
);
router.get("/albums/date", sortController.getAlbumSortedByDate);
router.get("/artists/alphabetical", sortController.getArtistsSortedByAlphabet);
router.get(
  "/playlist/tracks",
  sortController.getPlaylistBySortedByNumberOfTracks
);
router.get("/audios/popularity", sortController.getAudiosSortedByPopularity);
router.get("/albums/tracks", sortController.getAlbumsSortedByNumberOfTracks);
router.get(
  "/audios/alphabetical",
  sortController.getTracksSortedByAlphabetOfTheTitle
);

module.exports = router;
