const express = require("express");
const middlewares = require("./middlewares");
const config = require("./config");
const { redisClient } = require("../src/config/redis");
const app = express();
const swaggerUi = require("swagger-ui-express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
// const redis = require("redis");
const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("hex");
console.log(secretKey);
// const metricsMiddleware = require("./middlewares/metrics");
// const metrics = require("express-metrics");
const { APIReqestTime } = require("./middlewares/metrics");
const dbTimerMiddleware = require("./middlewares/dbTimer")
const { requestStatsMiddleware/*, getRequestStats*/ } = require("./middlewares/requestStats");
const redisLatencyMiddleware = require("./middlewares/redisLatency");


// const redisClient = redis.createClient();

app.use(express.json());
app.use(...middlewares.bodyParser);
app.use(middlewares.corsOptions);
app.use(middlewares.rateLimiter);
app.use(middlewares.helmet);
app.use(dbTimerMiddleware);
app.use(requestStatsMiddleware); // Middleware pour suivre les statuts HTTP
// Middleware global pour mesurer la latence Redis
app.use(redisLatencyMiddleware(redisClient));
// Configuration du middleware de session
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "session:",
      ttl: 86400 // Durée de vie des sessions en secondes
    }),
    secret: secretKey,//config.env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // À mettre sur `true` si HTTPS est utilisé
      maxAge: 24 * 60 * 60 * 1000 // 1 jour en millisecondes
    }
  })
);

// Configuration de express-metrics
app.use(APIReqestTime);

// app.use((req, res, next) => {
//   const start = Date.now();

//   res.on("finish", () => {
//     const duration = Date.now() - start; // Temps en millisecondes
//     console.log(`[METRICS] ${req.method} ${req.originalUrl} - ${duration}ms`);
//   });

//   next();
// });

// // Taux de succès/échec des requêtes
// // Exemple de routes
// app.get("/api/success", (req, res) => {
//   res.status(200).json({ message: "Ceci est une requête réussie." });
// });

// app.get("/api/failure", (req, res) => {
//   res.status(500).json({ error: "Ceci est une requête échouée." });
// });

// // Route pour obtenir les statistiques
// app.get("/metrics/requests", getRequestStats);


// Exemple de route avec des opérations Redis
app.get("/api/cache-test", async (req, res) => {
  try {
    // Mesurer une opération SET
    const startSet = performance.now();
    await redisClient.set("test_key", "Hello, Redis!", { EX: 60 });
    const endSet = performance.now();
    const setLatency = (endSet - startSet).toFixed(2);

    // Ajouter la latence SET dans les metrics
    req.redisMetrics.operations.push({ operation: "SET", latency: `${setLatency} ms` });

    // Mesurer une opération GET
    const startGet = performance.now();
    const cachedValue = await redisClient.get("test_key");
    const endGet = performance.now();
    const getLatency = (endGet - startGet).toFixed(2);

    // Ajouter la latence GET dans les metrics
    req.redisMetrics.operations.push({ operation: "GET", latency: `${getLatency} ms` });

    res.status(200).json({
      message: "Mesure des latences Redis réussie",
      redisMetrics: req.redisMetrics,
      cachedValue
    });
  } catch (err) {
    console.error("Erreur lors de l'accès à Redis :", err);
    res.status(500).json({ error: "Erreur Redis" });
  }
});

// Un autre endpoint utilisant Redis
app.get("/api/another-cache", async (req, res) => {
  try {
    const key = "another_key";
    const value = "Another Redis Value";

    // Mesurer l'opération SET
    const startSet = performance.now();
    await redisClient.set(key, value, { EX: 120 });
    const endSet = performance.now();
    const setLatency = (endSet - startSet).toFixed(2);

    req.redisMetrics.operations.push({ operation: "SET", latency: `${setLatency} ms` });

    res.status(200).json({
      message: "Endpoint spécifique mesuré",
      redisMetrics: req.redisMetrics
    });
  } catch (err) {
    console.error("Erreur lors de l'accès à Redis :", err);
    res.status(500).json({ error: "Erreur Redis" });
  }
});


app.get("/", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views += 1;
  }

  res.send(`Vous avez visité cette page ${JSON.stringify(req.session.views)} fois.`);
  // res.send({ message: "Welcome to DesHeures API Application" });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(config.swaggerSpec));
app.use("/api", require("./routes/index"));

config.connectToDatabase();

app.listen(config.env.port, () => {
  config.logger.info(
    `Server is running on http://localhost:${config.env.port}`
  );
  config.logger.info(
    `Swagger Docs available at http://localhost:${config.env.port}/api-docs`
  );
});
