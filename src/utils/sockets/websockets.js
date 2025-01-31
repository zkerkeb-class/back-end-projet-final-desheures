const { Server } = require("socket.io");
const {
  playlistSocketController
} = require("../../controllers/playlist.controller");

const configureWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    let sessionId = socket.handshake.query.sessionId;
    if (!sessionId) {
      sessionId = socket.id;
    }

    socket.on("playTrack", async (trackId) => {
      try {
        console.log(`Playing track: ${trackId}`);
        // Mettre à jour les deux types de playlists
        await playlistSocketController.updatePlaylistByType(
          trackId,
          sessionId,
          "recentlyPlayed"
        );
        await playlistSocketController.updatePlaylistByType(
          trackId,
          sessionId,
          "mostPlayed"
        );

        socket.emit("recentlyPlayedUpdated");
        socket.emit("mostPlayedUpdated");
      } catch (error) {
        console.error("Error handling playTrack event:", error);
      }
    });

    socket.on("getRecentlyPlayed", async () => {
      try {
        const tracks = await playlistSocketController.getPlaylistByType(
          sessionId,
          "recentlyPlayed"
        );
        socket.emit("recentlyPlayedTracks", tracks);
      } catch (error) {
        console.error("Error getting recently played:", error);
      }
    });

    socket.on("getMostPlayed", async () => {
      try {
        const tracks = await playlistSocketController.getPlaylistByType(
          sessionId,
          "mostPlayed"
        );
        socket.emit("mostPlayedTracks", tracks);
      } catch (error) {
        console.error("Error getting most played:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = configureWebSocket;
