/**
 * roomManager.js
 * In-memory store for all active collaboration rooms.
 * Each room holds: code, language, and a list of connected users.
 */

const rooms = new Map();

/**
 * Join or create a room.
 * @returns the room object
 */
const joinRoom = (roomId, user) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      code: '// Start coding together!\n',
      language: 'javascript',
      users: [],
    });
  }
  const room = rooms.get(roomId);
  // Remove stale entry for same socket (reconnect case)
  room.users = room.users.filter((u) => u.socketId !== user.socketId);
  room.users.push(user);
  return room;
};

const leaveRoom = (roomId, socketId) => {
  if (!rooms.has(roomId)) return null;
  const room = rooms.get(roomId);
  room.users = room.users.filter((u) => u.socketId !== socketId);
  if (room.users.length === 0) {
    rooms.delete(roomId); // clean up empty rooms
    return null;
  }
  return room;
};

const getRoom = (roomId) => rooms.get(roomId) || null;

const updateCode = (roomId, code) => {
  if (rooms.has(roomId)) rooms.get(roomId).code = code;
};

const updateLanguage = (roomId, language) => {
  if (rooms.has(roomId)) rooms.get(roomId).language = language;
};

/** Find any room a socket is currently in */
const getRoomBySocket = (socketId) => {
  for (const room of rooms.values()) {
    if (room.users.some((u) => u.socketId === socketId)) return room;
  }
  return null;
};

module.exports = { joinRoom, leaveRoom, getRoom, updateCode, updateLanguage, getRoomBySocket };
