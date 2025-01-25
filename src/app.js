const express = require("express");
const middlewares = require("./middlewares");
const config = require("./config");
const app = express();
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const { startScheduledBackups } = require("./utils/backup/backup.cron");
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
// app.use(middlewares.rateLimiter);
app.use(middlewares.helmet);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to DesHeures API Application" });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(config.swaggerSpec));
app.use("/api", require("./routes/index"));

startScheduledBackups();
config.connectToDatabase();
config.clearCacheAndCreateData;
config.redis;

app.listen(config.env.port, () => {
  config.logger.info(
    `Server is running on http://localhost:${config.env.port}`
  );
  config.logger.info(
    `Swagger Docs available at http://localhost:${config.env.port}/api-docs`
  );
});
