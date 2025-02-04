const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metrics.controller");

router.use("/server", metricsController.serverMetrics);

module.exports = router;
