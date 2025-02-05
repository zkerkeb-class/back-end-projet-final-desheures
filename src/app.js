const express = require("express");
const http = require("http");
const middlewares = require("./middlewares");
const config = require("./config");
const app = express();
const swaggerUi = require("swagger-ui-express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("hex");
const configureWebSocket = require("./utils/sockets/websockets");
const path = require("path");
const { startScheduledBackups } = require("./utils/backup/backup.cron");

const server = http.createServer(app);

// function testHusky() {
//   const test = "pas de guillemets simples";
//   var mauvaisVar = 123;
//   console.log(test);
//   return mauvaisVar;
// }
app.use("*", middlewares.corsOptions);
app.use(middlewares.metrics.APIReqestTime);
app.use(middlewares.requestStats.requestStatsMiddleware);
app.use(middlewares.metrics.dbTimer);
// app.use(middlewares.rateLimiter);
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

app.use(middlewares.helmet);



app.use(middlewares.redisLatency(config.redis));

app.use(
  session({
    store: new RedisStore({
      client: config.redis,
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

app.get("/", (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views += 1;
  }

  res.send(
    `Vous avez visité cette page ${JSON.stringify(req.session.views)} fois.`
  );
  res.send({ message: "Welcome to DesHeures API Application" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(config.swaggerSpec));
app.use("/api", require("./routes/index"));

startScheduledBackups();
config.connectToDatabase();

config.clearCacheAndCreateData;

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
