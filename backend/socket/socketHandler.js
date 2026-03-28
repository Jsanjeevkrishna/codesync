const {
  joinRoom,
  leaveRoom,
  updateCode,
  updateLanguage,
  getRoomBySocket,
} = require('./roomManager');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join / Create Room ────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, username }) => {
      if (!roomId || !username) return;

      const user = { socketId: socket.id, username };
      const room = joinRoom(roomId, user);

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = username;

      // Send current room state to the joining user only
      socket.emit('room-joined', {
        roomId,
        code: room.code,
        language: room.language,
        users: room.users,
      });

      // Notify everyone else in the room
      socket.to(roomId).emit('user-joined', {
        username,
        users: room.users,
      });

      console.log(`👤 ${username} joined room ${roomId}`);
    });

    // ── Code Sync ─────────────────────────────────────────────────────────
    socket.on('code-change', ({ roomId, code }) => {
      updateCode(roomId, code);
      // Broadcast to all OTHER users in the room (not the sender)
      socket.to(roomId).emit('code-update', { code });
    });

    // ── Language Change ───────────────────────────────────────────────────
    socket.on('language-change', ({ roomId, language }) => {
      updateLanguage(roomId, language);
      socket.to(roomId).emit('language-update', { language });
    });

    // ── Chat Message ──────────────────────────────────────────────────────
    socket.on('chat-message', ({ roomId, message }) => {
      const payload = {
        username: socket.data.username || 'Anonymous',
        message,
        timestamp: new Date().toISOString(),
      };
      // Broadcast to ALL in room (including sender so they see their own message)
      io.to(roomId).emit('chat-message', payload);
    });

    // ── Leave Room ────────────────────────────────────────────────────────
    socket.on('leave-room', () => {
      handleLeave(socket, io);
    });

    socket.on('disconnect', () => {
      handleLeave(socket, io);
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

const handleLeave = (socket, io) => {
  const roomId = socket.data.roomId;
  const username = socket.data.username;
  if (!roomId) return;

  const room = leaveRoom(roomId, socket.id);
  socket.leave(roomId);
  socket.data.roomId = null;

  if (room) {
    io.to(roomId).emit('user-left', { username, users: room.users });
  }
};

module.exports = initSocket;
