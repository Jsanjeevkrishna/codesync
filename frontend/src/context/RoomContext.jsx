import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import socket from '../socket/socket';

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const [inRoom, setInRoom]       = useState(false);
  const [roomId, setRoomId]       = useState('');
  const [username, setUsername]   = useState('');
  const [users, setUsers]         = useState([]);
  const [messages, setMessages]   = useState([]);
  const [roomCode, setRoomCode]   = useState(null);    // null = not in room
  const [roomLanguage, setRoomLanguage] = useState(null);

  // ── Socket listeners (attach once) ──────────────────────────────────────
  useEffect(() => {
    socket.on('room-joined', ({ roomId, code, language, users }) => {
      setRoomId(roomId);
      setUsers(users);
      setRoomCode(code);
      setRoomLanguage(language);
      setInRoom(true);
      addSystemMessage(`You joined room ${roomId}`);
    });

    socket.on('user-joined', ({ username, users }) => {
      setUsers(users);
      addSystemMessage(`${username} joined the room`);
    });

    socket.on('user-left', ({ username, users }) => {
      setUsers(users);
      addSystemMessage(`${username} left the room`);
    });

    socket.on('code-update', ({ code }) => {
      setRoomCode(code);
    });

    socket.on('language-update', ({ language }) => {
      setRoomLanguage(language);
    });

    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('chat-message');
    };
  }, []);

  const addSystemMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { username: 'System', message: text, timestamp: new Date().toISOString(), isSystem: true },
    ]);
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const joinRoom = useCallback((rid, uname) => {
    if (!socket.connected) socket.connect();
    setUsername(uname);
    socket.emit('join-room', { roomId: rid, username: uname });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit('leave-room');
    socket.disconnect();
    setInRoom(false);
    setRoomId('');
    setUsers([]);
    setMessages([]);
    setRoomCode(null);
    setRoomLanguage(null);
  }, []);

  const emitCodeChange = useCallback((code) => {
    if (inRoom) socket.emit('code-change', { roomId, code });
  }, [inRoom, roomId]);

  const emitLanguageChange = useCallback((language) => {
    if (inRoom) socket.emit('language-change', { roomId, language });
  }, [inRoom, roomId]);

  const sendChatMessage = useCallback((message) => {
    if (inRoom && message.trim()) socket.emit('chat-message', { roomId, message });
  }, [inRoom, roomId]);

  return (
    <RoomContext.Provider value={{
      inRoom, roomId, username, users, messages,
      roomCode, setRoomCode, roomLanguage, setRoomLanguage,
      joinRoom, leaveRoom, emitCodeChange, emitLanguageChange, sendChatMessage,
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used inside RoomProvider');
  return ctx;
};
