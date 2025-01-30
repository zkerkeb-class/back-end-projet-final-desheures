const { Server } = require("socket.io");

const configureWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("createRoom", ({ roomId, username }) => {
      const room = {
        id: roomId,
        participants: [{ id: socket.id, name: username }],
        host: socket.id,
        currentTrack: null
      };

      rooms.set(roomId, room);
      socket.join(roomId);

      socket.emit("roomCreated", {
        roomId,
        participants: room.participants
      });
    });

    socket.on("joinRoom", ({ roomId, username }) => {
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error", { message: "Room introuvable" });
        return;
      }

      const newParticipant = { id: socket.id, name: username };
      room.participants.push(newParticipant);
      socket.join(roomId);

      // Informer le nouveau participant de tous les participants actuels
      socket.emit("roomJoined", {
        roomId,
        participants: room.participants,
        currentTrack: room.currentTrack
      });

      // Informer les autres participants du nouvel arrivant
      socket.to(roomId).emit("userJoined", newParticipant);
    });

    socket.on("syncPlayback", ({ roomId, currentTime, isPlaying, audioId }) => {
      const room = rooms.get(roomId);
      if (room && room.host === socket.id) {
        socket.to(roomId).emit("playbackUpdate", {
          currentTime,
          isPlaying,
          audioId
        });
      }
    });

    // eslint-disable-next-line no-unused-vars
    socket.on("trackChange", ({ roomId, audioId, audioData, targetUserId }) => {
      const room = rooms.get(roomId);
      if (room && room.host === socket.id) {
        room.currentTrack = audioData;
        if (targetUserId) {
          // Sync spécifique pour un utilisateur
          io.to(targetUserId).emit("trackChange", { audioData });
        } else {
          // Sync pour toute la room
          socket.to(roomId).emit("trackChange", { audioData });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      for (const [roomId, room] of rooms.entries()) {
        const participantIndex = room.participants.findIndex(
          (p) => p.id === socket.id
        );

        if (participantIndex !== -1) {
          const isHost = room.host === socket.id;
          room.participants.splice(participantIndex, 1);

          if (room.participants.length === 0) {
            rooms.delete(roomId);
          } else if (isHost) {
            // Si l'hôte part, on assigne un nouvel hôte
            room.host = room.participants[0].id;
          }

          socket.to(roomId).emit("userLeft", { userId: socket.id });
        }
      }
    });
  });

  return io;
};

module.exports = configureWebSocket;
