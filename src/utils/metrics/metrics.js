/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
// metrics.js
const promClient = require("prom-client");
const si = require("systeminformation");
const config = require("../../config");

// -------------------------------
// 1. Collecte des métriques par défaut
// -------------------------------
// promClient.collectDefaultMetrics({ prefix: 'node_app_' });

// a) Mesurer le temps des requêtes HTTP
const httpRequestDurationMilliseconds = new promClient.Histogram({
  name: "request_duration",
  help: "Durée des requêtes HTTP en ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 5, 10, 50, 100, 500, 1000, 3000, 5000]
});

// b) Compteurs pour le succès et l'erreur des requêtes HTTP
const httpRequestSuccessCounter = new promClient.Counter({
  name: "request_success_total",
  help: "Nombre total de requêtes HTTP réussies",
  labelNames: ["method", "route", "status_code"]
});

const httpRequestErrorCounter = new promClient.Counter({
  name: "request_error_total",
  help: "Nombre total de requêtes HTTP en erreur",
  labelNames: ["method", "route", "status_code"]
});

// c) Durée d'exécution des requêtes MongoDB
const mongoQueryDurationMs = new promClient.Histogram({
  name: "mongo_query_duration_ms",
  help: "Durée d'exécution des requêtes MongoDB en millisecondes",
  labelNames: ["operation", "collection"],
  buckets: [1, 5, 10, 50, 100, 500, 1000, 5000]
});

// Compteur pour suivre le nombre total de requêtes MongoDB
const mongoQueryCount = new promClient.Counter({
  name: "mongo_query_count",
  help: "Nombre total de requêtes MongoDB exécutées",
  labelNames: ["operation", "collection"]
});

// f) Compteur pour mesurer la bande passante (en octets transférés)
const bandwidthBytesCounter = new promClient.Counter({
  name: "http_bandwidth_bytes_total",
  help: "Nombre total d'octets transférés",
  labelNames: ["direction"]
});

// -------------------------------
// 5. Middlewares et Helpers de Monitoring
// -------------------------------
function metricsMiddleware(req, res, next) {
  if (req.path === "/api/metrics/") {
    return next();
  }
  const start = process.hrtime();

  // Comptabilisation de la bande passante entrante
  const reqContentLength = parseInt(req.headers["content-length"] || "0", 10);
  bandwidthBytesCounter.labels("in").inc(reqContentLength);

  // Intercepter l'écriture de la réponse pour mesurer la bande passante sortante
  const originalWrite = res.write;
  const originalEnd = res.end;
  let responseLength = 0;

  res.write = function (chunk, encoding, callback) {
    if (chunk) {
      responseLength += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, encoding);
    }
    originalWrite.apply(res, arguments);
  };

  res.end = function (chunk, encoding, callback) {
    if (chunk) {
      responseLength += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, encoding);
    }
    bandwidthBytesCounter.labels("out").inc(responseLength);
    originalEnd.apply(res, arguments);
  };

  res.on("finish", () => {
    const route = req.route && req.route.path ? req.route.path : req.path;
    const diff = process.hrtime(start);
    const responseTimeInMs = (diff[0] * 1e9 + diff[1]) / 1e6;
    httpRequestDurationMilliseconds
      .labels(req.method, route, res.statusCode)
      .observe(responseTimeInMs);

    if (res.statusCode >= 200 && res.statusCode < 400) {
      httpRequestSuccessCounter.labels(req.method, route, res.statusCode).inc();
    } else {
      httpRequestErrorCounter.labels(req.method, route, res.statusCode).inc();
    }
  });

  next();
}

/**
 * Helper pour enrober une requête MongoDB et mesurer sa durée d'exécution.
 */
async function monitorMongoQuery(operation, collection, queryFunc) {
  const start = process.hrtime();

  try {
    const result = await queryFunc();
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    mongoQueryDurationMs.labels(operation, collection).observe(durationMs);
    mongoQueryCount.labels(operation, collection).inc();

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Retourne l'ensemble des métriques collectées sous forme de JSON.
 */
async function getMetrics() {
  return await promClient.register.getMetricsAsJSON();
}

async function getSystemMetrics(req, res, next) {
  try {
    const cpu = await si.currentLoad();
    const memory = await si.mem();
    const disk = await si.fsSize();
    const metrics = {
      cpu: {
        usage_percent: `${cpu.currentLoad.toFixed(2)}`
      },
      memory: {
        total_GB: `${(memory.total / 1e9).toFixed(2)}`,
        used_GB: `${(memory.active / 1e9).toFixed(2)}`,
        free_GB: `${(memory.available / 1e9).toFixed(2)}`
      },
      disk: disk.map((d) => ({
        filesystem: d.fs,
        total_GB: `${(d.size / 1e9).toFixed(2)}`,
        used_GB: `${(d.used / 1e9).toFixed(2)}`,
        usage_percent: `${((d.used / d.size) * 100).toFixed(2)}`
      }))
    };

    res.status(200).json(metrics);
  } catch (err) {
    config.logger.error(
      "Erreur lors de la collecte des métriques serveur :",
      err
    );
    res
      .status(500)
      .json({ error: "Impossible de récupérer les métriques serveur" });
  }
}

// -------------------------------
// 6. Export des fonctionnalités de monitoring
// -------------------------------
module.exports = {
  metricsMiddleware,
  monitorMongoQuery,
  getMetrics,
  getSystemMetrics,
  promClient
};
