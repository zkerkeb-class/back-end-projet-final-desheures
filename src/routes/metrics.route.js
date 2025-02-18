const express = require("express");
const router = express.Router();
const middlewares = require("../middlewares");
const metrics = require("../utils/metrics/metrics");
const metricsController = require("../controllers/metrics.controller");

// router.get("/ApiRequestTime/", middlewares.metrics.getAPIRequestTime);
// router.get("/server", metricsController.serverMetrics);
// router.get("/requestStats", middlewares.requestStats.getRequestStats);
// router.get("/dbTime", middlewares.metrics.getDbTimer);
// router.get("/metrics", metrics.getMetrics);
// Endpoint pour récupérer les métriques (au format JSON)
router.get('/', async (req, res) => {
    try {
      const metric = await metrics.getMetrics();
    //   const filteredMetrics = metric.map(metric => {
    //     if (metric.name === 'http_request_duration_ms') {
    //       // Filtrer pour ne garder que les éléments qui ne sont pas des buckets
    //       metric.values = metric.values.filter(value => !value.metricName.includes('_bucket'));
    //     }
    //     return metric;
    //   });
      res.json(metric);
    //   res.json(metric);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get('/system', metrics.getSystemMetrics);

module.exports = router;
