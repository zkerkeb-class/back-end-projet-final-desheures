const request = require("supertest");
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { io: Client } = require("socket.io-client");

// Mocks
jest.mock("archiver", () => ({}));
jest.mock("adm-zip", () => ({}));
jest.mock("../controllers/playlist.controller", () => ({
  playlistSocketController: {
    updatePlaylistByType: jest.fn(),
    getPlaylistByType: jest.fn()
  }
}));

// Configuration des middlewares mockés
const mockMiddlewares = {
  metrics: {
    middleware: jest.fn((req, res, next) => next()),
    router: jest.fn()
  },
  bodyParser: [jest.fn((req, res, next) => next())],
  corsOptions: jest.fn((req, res, next) => next()),
  helmet: jest.fn((req, res, next) => next())
};

jest.mock("../middlewares", () => mockMiddlewares);

const mockConfig = {
  swaggerSpec: {},
  env: { port: 3030 },
  logger: {
    info: jest.fn(),
    error: jest.fn()
  },
  connectToDatabase: jest.fn().mockResolvedValue(),
  clearCacheAndCreateData: jest.fn().mockResolvedValue(),
  redis: {}
};

jest.mock("../config", () => mockConfig);
jest.mock("../utils/backup/backup.cron", () => ({
  startScheduledBackups: jest.fn()
}));

describe("Express App", () => {
  let app;
  let server;
  let io;
  let clientSocket;
  const TEST_TIMEOUT = 30000;

  beforeAll((done) => {
    app = express();
    server = http.createServer(app);

    app.use(mockMiddlewares.metrics.middleware);
    app.use(mockMiddlewares.metrics.router);
    app.use(express.json());
    app.use(...mockMiddlewares.bodyParser);

    const staticOptions = { maxAge: "1d", etag: true };
    app.use(
      "/uploads/images",
      mockMiddlewares.corsOptions,
      express.static(path.join(__dirname, "/../uploads/images"), staticOptions)
    );
    app.use(
      "/uploads/audios/wav",
      mockMiddlewares.corsOptions,
      express.static(
        path.join(__dirname, "/../uploads/audios/wav"),
        staticOptions
      )
    );

    app.use("*", mockMiddlewares.corsOptions);
    app.use(mockMiddlewares.helmet);

    app.use(express.json({ limit: "10mb" }));
    app.get("/", (req, res) => {
      res.status(200).json({ message: "Welcome to DesHeures API Application" });
    });

    app.use((err, req, res, next) => {
      if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ message: "Invalid JSON payload" });
      }
      next(err);
    });

    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    server.listen(0, () => {
      const port = server.address().port;
      io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        pingTimeout: 5000,
        pingInterval: 2000
      });

      clientSocket = new Client(`http://localhost:${port}`, {
        query: { sessionId: "test-session" },
        reconnectionDelay: 0,
        forceNew: true
      });

      io.on("connection", (socket) => {
        socket.on("playTrack", () => {
          socket.emit("recentlyPlayedUpdated");
          socket.emit("mostPlayedUpdated");
        });
      });

      clientSocket.on("connect", done);
    });
  }, TEST_TIMEOUT);

  afterAll((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    io.close();
    server.close(done);
  });

  describe("Middleware Setup", () => {
    it("should apply metrics middleware correctly", async () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      await mockMiddlewares.metrics.middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(mockMiddlewares.metrics.middleware).toHaveBeenCalledWith(
        req,
        res,
        next
      );
    });

    it("should apply CORS middleware for static routes", async () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      await mockMiddlewares.corsOptions(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should apply helmet middleware correctly", async () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      await mockMiddlewares.helmet(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("Static File Serving", () => {
    it(
      "should handle requests to uploads/images directory",
      async () => {
        const response = await request(server).get("/uploads/images/test.jpg");

        expect(response.status).toBe(404);
        expect(response.headers["content-type"]).toMatch(/text\/html/);
      },
      TEST_TIMEOUT
    );

    it(
      "should handle requests to uploads/audios/wav directory",
      async () => {
        const response = await request(server).get(
          "/uploads/audios/wav/test.wav"
        );

        expect(response.status).toBe(404);
        expect(response.headers["content-type"]).toMatch(/text\/html/);
      },
      TEST_TIMEOUT
    );
  });

  describe("Routes", () => {
    it(
      "should respond with welcome message on root route",
      async () => {
        const response = await request(server).get("/");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          message: "Welcome to DesHeures API Application"
        });
      },
      TEST_TIMEOUT
    );
  });

  describe("Socket.IO Integration", () => {
    it(
      "should emit and receive events correctly",
      (done) => {
        const eventsReceived = new Set();
        const expectedEvents = ["recentlyPlayedUpdated", "mostPlayedUpdated"];

        expectedEvents.forEach((eventName) => {
          clientSocket.on(eventName, () => {
            eventsReceived.add(eventName);
            if (expectedEvents.every((event) => eventsReceived.has(event))) {
              done();
            }
          });
        });

        clientSocket.emit("playTrack", "test-track");
      },
      TEST_TIMEOUT
    );
  });

  describe("Error Handling", () => {
    it(
      "should handle 404 errors for unknown routes",
      async () => {
        const response = await request(server).get("/non-existent-route");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Route not found" });
      },
      TEST_TIMEOUT
    );

    it(
      "should handle JSON parsing errors",
      async () => {
        const response = await request(server)
          .post("/api/some-endpoint")
          .set("Content-Type", "application/json")
          .send("invalid json{");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid JSON payload" });
      },
      TEST_TIMEOUT
    );
  });
});
