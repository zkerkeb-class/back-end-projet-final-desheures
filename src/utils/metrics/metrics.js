// metrics.js
const promClient = require('prom-client');
const os = require('os');
const diskusage = require('diskusage');
const { redisClient } = require('../../config/redis');



// -------------------------------
// 1. Collecte des métriques par défaut
// -------------------------------
// promClient.collectDefaultMetrics({ prefix: 'node_app_' });

// -------------------------------
// 2. Définition des métriques personnalisées
// -------------------------------

// a) Mesurer le temps des requêtes HTTP
const httpRequestDurationMilliseconds = new promClient.Histogram({
  name: 'request_duration',
  help: 'Durée des requêtes HTTP en ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 5, 10, 50, 100, 500, 1000, 3000, 5000]
});

// const lastHttpRequestDurationMs = new promClient.Gauge({
//     name: 'http_last_request_duration_ms',
//     help: 'Durée de chaque requête HTTP en millisecondes',
//     labelNames: ['method', 'route', 'status_code']
//   });
  
//   const totalHttpRequestDurationMs = new promClient.Counter({
//     name: 'http_total_request_duration_ms',
//     help: 'Somme totale des durées des requêtes HTTP en millisecondes'
//   });

// b) Compteurs pour le succès et l'erreur des requêtes HTTP
const httpRequestSuccessCounter = new promClient.Counter({
  name: 'request_success_total',
  help: 'Nombre total de requêtes HTTP réussies',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestErrorCounter = new promClient.Counter({
  name: 'request_error_total',
  help: 'Nombre total de requêtes HTTP en erreur',
  labelNames: ['method', 'route', 'status_code']
});

// c) Durée d'exécution des requêtes MongoDB
// Histogramme pour mesurer la durée des requêtes MongoDB
const mongoQueryDurationMs = new promClient.Histogram({
    name: 'mongo_query_duration_ms',
    help: 'Durée d\'exécution des requêtes MongoDB en millisecondes',
    labelNames: ['operation', 'collection'],
    buckets: [1, 5, 10, 50, 100, 500, 1000, 5000] // En millisecondes
  });
  
  // Compteur pour suivre le nombre total de requêtes MongoDB
  const mongoQueryCount = new promClient.Counter({
    name: 'mongo_query_count',
    help: 'Nombre total de requêtes MongoDB exécutées',
    labelNames: ['operation', 'collection']
  });

// // d) Durée des commandes Redis
// const redisCommandDurationSeconds = new promClient.Histogram({
//   name: 'redis_command_duration_seconds',
//   help: 'Durée d\'exécution des commandes Redis en secondes',
//   labelNames: ['command'],
//   buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
// });

// // e) Gauge pour l'espace disque disponible
// const diskSpaceGauge = new promClient.Gauge({
//   name: 'disk_space_available_bytes',
//   help: 'Espace disque disponible en octets',
//   labelNames: ['mount']
// });

// // f) Compteur pour mesurer la bande passante (en octets transférés)
// const bandwidthBytesCounter = new promClient.Counter({
//   name: 'http_bandwidth_bytes_total',
//   help: 'Nombre total d\'octets transférés',
//   labelNames: ['direction'] // 'in' pour les données entrantes, 'out' pour les données sortantes
// });

// -------------------------------
// 3. Initialisation du client Redis
// -------------------------------
// const redisClient = redis.createClient();

// -------------------------------
// 4. Mise à jour périodique de l'espace disque
// -------------------------------
// function updateDiskUsage() {
//   // Exemple pour Linux (la racine "/") ou Windows (disque "c:")
//   const path = os.platform() === 'win32' ? 'c:' : '/';
//   diskusage.check(path, (err, info) => {
//     if (!err && info) {
//       diskSpaceGauge.labels(path).set(info.available);
//     }
//   });
// }
// setInterval(updateDiskUsage, 10000); // mise à jour toutes les 10 secondes
// updateDiskUsage();

// -------------------------------
// 5. Middlewares et Helpers de Monitoring
// -------------------------------

/**
 * Middleware Express qui mesure le temps de réponse des requêtes et la bande passante.
 */
function metricsMiddleware(req, res, next) {
    console.log(req.path);
    if (req.path === "/api/metrics/") {
        return next(); // Ignore ce middleware pour cette route
      }
  const start = process.hrtime();

  // Comptabilisation de la bande passante entrante
//   const reqContentLength = parseInt(req.headers['content-length'] || '0', 10);
//   bandwidthBytesCounter.labels('in').inc(reqContentLength);

  // Intercepter l'écriture de la réponse pour mesurer la bande passante sortante
//   const originalWrite = res.write;
//   const originalEnd = res.end;
//   let responseLength = 0;

//   res.write = function (chunk, encoding, callback) {
//     if (chunk) {
//       responseLength += Buffer.isBuffer(chunk)
//         ? chunk.length
//         : Buffer.byteLength(chunk, encoding);
//     }
//     originalWrite.apply(res, arguments);
//   };

//   res.end = function (chunk, encoding, callback) {
//     if (chunk) {
//       responseLength += Buffer.isBuffer(chunk)
//         ? chunk.length
//         : Buffer.byteLength(chunk, encoding);
//     }
//     bandwidthBytesCounter.labels('out').inc(responseLength);
//     originalEnd.apply(res, arguments);
//   };

  // Une fois la réponse envoyée, enregistre le temps de réponse et les compteurs
  res.on('finish', () => {
    const route = (req.route && req.route.path) ? req.route.path : req.path;
    const diff = process.hrtime(start);
    const responseTimeInMs = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
    httpRequestDurationMilliseconds.labels(req.method, route, res.statusCode).observe(responseTimeInMs);
    // Enregistrer la durée de cette requête
    // lastHttpRequestDurationMs.labels(req.method, req.path, res.statusCode).set(responseTimeInMs);
    // Ajouter cette durée à la somme totale
    // totalHttpRequestDurationMs.inc(responseTimeInMs);
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
 *
 * @param {string} operation - Le nom de l'opération (ex: 'find', 'update', etc.)
 * @param {string} collection - Le nom de la collection concernée
 * @param {Function} queryFunc - La fonction qui exécute la requête (doit retourner une Promise)
 */
async function monitorMongoQuery(operation, collection, queryFunc) {
    const start = process.hrtime();

    try {
      const result = await queryFunc();
      const diff = process.hrtime(start);
      const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6; // Convertir en millisecondes
  
      // Enregistrer la durée dans l'histogramme
      mongoQueryDurationMs.labels(operation, collection).observe(durationMs);
  
      // Incrémenter le compteur
      mongoQueryCount.labels(operation, collection).inc();
  
      return result;
    } catch (error) {
      throw error;
    }
}

/**
 * Helper pour enrober une commande Redis et mesurer sa durée.
 *
 * @param {string} command - Le nom de la commande Redis
 * @param  {...any} args - Les arguments de la commande Redis
 */
// function monitorRedisCommand(command, ...args) {
//   const start = Date.now();
//   return new Promise((resolve, reject) => {
//     redisClient[command](...args, (err, result) => {
//       const duration = (Date.now() - start) / 1000;
//       redisCommandDurationSeconds.labels(command).observe(duration);
//       if (err) {
//         return reject(err);
//       }
//       resolve(result);
//     });
//   });
// }

/**
 * Retourne l'ensemble des métriques collectées sous forme de JSON.
 */
async function getMetrics() {
  return await promClient.register.getMetricsAsJSON();
}




/**
 * Fonction pour récupérer les statistiques système en temps réel.
 */
async function getSystemMetrics(req, res, next)  {
    // Utilisation de la mémoire en Mo
    const totalMemory = os.totalmem() / (1024 * 1024);
    const freeMemory = os.freemem() / (1024 * 1024);
    const usedMemory = totalMemory - freeMemory;
  
    // Utilisation du CPU
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
  
    cpus.forEach((cpu) => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
  
    const idleDiff = totalIdle / cpus.length;
    const totalDiff = totalTick / cpus.length;
    const cpuUsage = (1 - idleDiff / totalDiff) * 100;
  
    // Espace disque
    const path = os.platform() === 'win32' ? 'C:' : '/';
    let availableDiskGb = null;
    try {
      const info = await diskusage.check(path);
      availableDiskGb = info.available / (1024 * 1024 * 1024);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'espace disque:", error);
    }
  
    res.json({
      cpu_usage_percent: parseFloat(cpuUsage.toFixed(2)),
      memory_usage_mb: parseFloat(usedMemory.toFixed(2)),
      disk_available_gb: parseFloat((availableDiskGb || 0).toFixed(2))
    });
  }
  




// -------------------------------
// 6. Export des fonctionnalités de monitoring
// -------------------------------
module.exports = {
  metricsMiddleware,
  monitorMongoQuery,
//   monitorRedisCommand,
  getMetrics,
  getSystemMetrics,
  // Pour pouvoir éventuellement étendre ou consulter d'autres métriques :
  promClient
};
