const express = require("express");
const authRoute = require("./auth.route");
const artistRoute = require("./artist.route");
const audioRoute = require("./audio.route");
const albumRoute = require("./album.route");
const playlistRoute = require("./playlist.route");
const imageRoute = require("./image.route");
const filterRoute = require("./filter.route");
const metricsRoute = require("./metrics.route");

const sortRoute = require("./sort.route");
const searchRoute = require("./search.route");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/artist", artistRoute);
router.use("/audio", audioRoute);
router.use("/image", imageRoute);
router.use("/album", albumRoute);
router.use("/playlist", playlistRoute);
router.use("/filter", filterRoute);
router.use("/metrics", metricsRoute);
router.use("/sort", sortRoute);
router.use("/search", searchRoute);

module.exports = router;
