const fs = require("fs");
const path = require("path");
const pino = require("pino");

const logsDir = path.resolve("./logs");
const logFile = path.join(logsDir, "app.log");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "");
}

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname"
        },
        level: process.env.NODE_ENV === "production" ? "info" : "debug"
      },
      {
        target: "pino-roll",
        options: {
          file: "./logs/app.log",
          size: "10m",
          interval: "1d",
          maxFiles: 5
        },
        level: "info"
      }
    ]
  }
});

module.exports = logger;
