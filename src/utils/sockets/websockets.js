/* eslint-disable no-unused-vars */
const { Server } = require("socket.io");
const {
  playlistSocketController
} = require("../../controllers/playlist.controller");
const config = require("../../config");

// Stockage des rooms et leurs participants
const rooms = new Map();

const configureWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    let sessionId = socket.handshake.query.sessionId;
    let currentRoom = null;
    let userName = null;

    if (!sessionId) {
      sessionId = socket.id;
    }

    // Gestion des playlists
    socket.on("playTrack", async (trackId) => {
      try {
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
        config.logger.error("Error handling playTrack event:", error);
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
        config.logger.error("Error getting recently played:", error);
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
        config.logger.error("Error getting most played:", error);
      }
    });

    socket.on("createRoom", ({ name }) => {
      const roomId = Math.random().toString(36).substring(2, 8);
      userName = name;
      currentRoom = roomId;

      rooms.set(roomId, {
        host: socket.id,
        participants: [
          {
            id: socket.id,
            name: name,
            isHost: true
          }
        ],
        currentTrack: null,
        isPlaying: false,
        timestamp: 0
      });

      socket.join(roomId);
      socket.emit("roomCreated", { roomId });
      io.to(roomId).emit("participantsUpdate", rooms.get(roomId).participants);
    });

    socket.on("joinRoom", ({ roomId, name }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      userName = name;
      currentRoom = roomId;

      // Ajouter le participant
      room.participants.push({
        id: socket.id,
        name: name,
        isHost: false
      });

      socket.join(roomId);

      // Envoyer l'état actuel au nouveau participant
      socket.emit("roomState", {
        currentTrack: room.currentTrack,
        isPlaying: room.isPlaying,
        timestamp: room.timestamp
      });

      // Mettre à jour la liste des participants pour tout le monde
      io.to(roomId).emit("participantsUpdate", room.participants);
    });

    // Synchronisation de la lecture
    socket.on("syncPlay", ({ roomId, trackId, timestamp }) => {
      const room = rooms.get(roomId);
      if (room && room.host === socket.id) {
        room.currentTrack = trackId;
        room.isPlaying = true;
        room.timestamp = timestamp;

        io.to(roomId).emit("playbackUpdate", {
          currentTrack: trackId,
          isPlaying: true,
          timestamp
        });
      }
    });

    socket.on("syncPause", ({ roomId, timestamp }) => {
      const room = rooms.get(roomId);
      if (room && room.host === socket.id) {
        room.isPlaying = false;
        room.timestamp = timestamp;

        io.to(roomId).emit("playbackUpdate", {
          currentTrack: room.currentTrack,
          isPlaying: false,
          timestamp
        });
      }
    });

    socket.on("disconnect", () => {
      if (currentRoom) {
        const room = rooms.get(currentRoom);
        if (room) {
          // Retirer le participant
          room.participants = room.participants.filter(
            (p) => p.id !== socket.id
          );

          if (room.participants.length === 0) {
            // Supprimer la room si vide
            rooms.delete(currentRoom);
          } else if (room.host === socket.id) {
            // Transférer l'hôte au premier participant restant
            const newHost = room.participants[0];
            room.host = newHost.id;
            room.participants = room.participants.map((p) => ({
              ...p,
              isHost: p.id === newHost.id
            }));
            io.to(currentRoom).emit("hostUpdate", newHost.id);
          }

          // Mettre à jour la liste des participants
          io.to(currentRoom).emit("participantsUpdate", room.participants);
        }
      }
    });

    socket.on("leaveRoom", () => {
      if (currentRoom) {
        const room = rooms.get(currentRoom);
        if (room) {
          socket.leave(currentRoom);

          // Retirer le participant
          room.participants = room.participants.filter(
            (p) => p.id !== socket.id
          );

          if (room.participants.length === 0) {
            rooms.delete(currentRoom);
          } else if (room.host === socket.id) {
            // Transférer l'hôte
            const newHost = room.participants[0];
            room.host = newHost.id;
            room.participants = room.participants.map((p) => ({
              ...p,
              isHost: p.id === newHost.id
            }));
            io.to(currentRoom).emit("hostUpdate", newHost.id);
          }

          io.to(currentRoom).emit("participantsUpdate", room.participants);
        }
        currentRoom = null;
        userName = null;
      }
    });
  });

  return io;
};

module.exports = configureWebSocket;
