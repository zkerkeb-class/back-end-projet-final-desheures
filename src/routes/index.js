const express = require("express");
const authRoute = require("./auth.route");
const artistRoute = require("./artist.route");
const audioRoute = require("./audio.route");
const albumRoute = require("./album.route");
const playlistRoute = require("./playlist.route");
const filterRoute = require("./filter.route");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/artist", artistRoute);
router.use("/audio", audioRoute);
router.use("/album", albumRoute);
router.use("/playlist", playlistRoute);
router.use("/filter", filterRoute);
module.exports = router;
