const pino = require("pino");

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
