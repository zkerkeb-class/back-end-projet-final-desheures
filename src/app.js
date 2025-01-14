const express = require("express");
const middlewares = require("./middlewares");
const config = require("./config");
const app = express();
const swaggerUi = require("swagger-ui-express");

app.use(express.json());
app.use(...middlewares.bodyParser);
app.use(middlewares.corsOptions);
app.use(middlewares.rateLimiter);
app.use(middlewares.helmet);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to DesHeures API Application" });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(config.swaggerSpec));
app.use("/api", require("./routes/index"));

config.connectToDatabase();
config.redis;
const redisTest = async () => {
  try {
    await config.redis.set("test_key", "test_value", { EX: 60 });
    const value = await config.redis.get("test_key");
    config.logger.info(`Redis test value: ${value}`);
  } catch (err) {
    config.logger.error("Redis test error:", err);
  }
};

// Exécute le test Redis
redisTest();
app.listen(config.env.port, () => {
  config.logger.info(
    `Server is running on http://localhost:${config.env.port}`
  );
  config.logger.info(
    `Swagger Docs available at http://localhost:${config.env.port}/api-docs`
  );
});
