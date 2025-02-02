const promClient = require("prom-client");
const express = require("express");

// Create a Registry
const register = new promClient.Registry();

// Enable default metrics
promClient.collectDefaultMetrics({
  register,
  prefix: "desheures_"
});

// HTTP metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"]
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);

// Middleware function
const metrics = (req, res, next) => {
  if (req.path === "/metrics") {
    next();
    return;
  }

  const start = process.hrtime();

  res.on("finish", () => {
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    httpRequestDurationMicroseconds
      .labels(req.method, route, statusCode)
      .observe(durationInSeconds);

    httpRequestCounter.labels(req.method, route, statusCode).inc();
  });

  next();
};

// Metrics endpoint router
const metricsRouter = express.Router();
metricsRouter.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

module.exports = {
  middleware: metrics,
  router: metricsRouter
};
