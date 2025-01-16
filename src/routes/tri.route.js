const express = require("express");
const router = express.Router();
const triController = require("../controllers/tri.controller");

router.get("/audios/duration/asc", triController.getAudiosSortedByDurationAsc);
router.get(
  "/audios/duration/desc",
  triController.getAudiosSortedByDurationDesc
);
router.get("/albums/date", triController.getAlbumSortedByDate);
router.get("/artists/alphabetical", triController.getArtistsSortedByAlphabet);
router.get(
  "/playlist/tracks",
  triController.getPlaylistBySortedByNumberOfTracks
);
router.get("/audios/popularity", triController.getAudiosSortedByPopularity);
router.get("/albums/tracks", triController.getAlbumsSortedByNumberOfTracks);
router.get(
  "/audios/alphabetical",
  triController.getTracksSortedByAlphabetOfTheTitle
);

module.exports = router;
