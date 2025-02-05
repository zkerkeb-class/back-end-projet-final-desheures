const express = require("express");
const router = express.Router();
const middlewares = require("../middlewares");
const metricsController = require("../controllers/metrics.controller");

router.get("/ApiRequestTime/", middlewares.metrics.getAPIRequestTime);
router.get("/server", metricsController.serverMetrics);
router.get("/requestStats", middlewares.requestStats.getRequestStats);
router.get("/dbTime", middlewares.metrics.getDbTimer);

module.exports = router;
