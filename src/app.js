const express = require("express");
const http = require("http");
const middlewares = require("./middlewares");
const config = require("./config");
const configureWebSocket = require("./utils/sockets/websockets");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const { startScheduledBackups } = require("./utils/backup/backup.cron");

const app = express();
const server = http.createServer(app);

// Configuration des middlewares

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

// Routes

app.get("/", (req, res) => {
  res.send({ message: "Welcome to DesHeures API Application" });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(config.swaggerSpec));
app.use("/api", require("./routes/index"));

// Initialisation des services
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
