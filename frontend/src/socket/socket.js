import { io } from 'socket.io-client';

// In production use the env variable; in local dev fall back to same host on port 5000
const BACKEND_URL =
  import.meta.env.VITE_SOCKET_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

const socket = io(BACKEND_URL, {
  autoConnect: false,   // connect only when user joins a room
  transports: ['websocket'],
});

export default socket;
