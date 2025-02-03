const express = require("express");
const http = require("http");
const middlewares = require("./middlewares");
const config = require("./config");
const { redisClient } = require("../src/config/redis");
const app = express();
const swaggerUi = require("swagger-ui-express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("hex");
const { APIReqestTime } = require("./middlewares/metrics");
const dbTimerMiddleware = require("./middlewares/dbTimer")
const { requestStatsMiddleware, getRequestStats } = require("./middlewares/requestStats");
const redisLatencyMiddleware = require("./middlewares/redisLatency");
const configureWebSocket = require("./utils/sockets/websockets");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const { startScheduledBackups } = require("./utils/backup/backup.cron");

const app = express();
const server = http.createServer(app);

// function testHusky() {
//   const test = "pas de guillemets simples";
//   var mauvaisVar = 123;
//   console.log(test);
//   return mauvaisVar;
// }

app.use(middlewares.metrics.middleware);
app.use(middlewares.metrics.router);
app.use(express.json());
app.use(...middlewares.bodyParser);
app.use(
  "/uploads/images",
  middlewares.corsOptions,
  express.static(path.join(__dirname, "/../uploads/images"))
);
app.use(
  "/uploads/audios/wav",
  middlewares.corsOptions,
  express.static(path.join(__dirname, "/../uploads/audios/wav"))
);
app.use("*", middlewares.corsOptions);
app.use(middlewares.helmet);
app.use(dbTimerMiddleware);
app.use(requestStatsMiddleware);
app.use(getRequestStats);

app.use(redisLatencyMiddleware(redisClient));

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "session:",
      ttl: 86400 
    }),
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(APIReqestTime);


app.get("/", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views += 1;
  }

  res.send(`Vous avez visité cette page ${JSON.stringify(req.session.views)} fois.`);
  res.send({ message: "Welcome to DesHeures API Application" });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(config.swaggerSpec));
app.use("/api", require("./routes/index"));

startScheduledBackups();
config.connectToDatabase();

config.clearCacheAndCreateData;
config.redis;

// eslint-disable-next-line no-unused-vars
const io = configureWebSocket(server);

server.listen(config.env.port, () => {

  config.logger.info(
    `✅ Server Express & WebSocket is running on http://localhost:${config.env.port}`
  );
  config.logger.info(
    `✅ Swagger Docs available at http://localhost:${config.env.port}/api-docs`
  );
});
