require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const initSocket = require('./socket/socketHandler');

// Routes
const executeRoutes = require('./routes/executeRoutes');
const snippetRoutes = require('./routes/snippetRoutes');
const extensionRoutes = require('./routes/extensionRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); // wrap express with http server

// Allowed origins: comma-separated in ALLOWED_ORIGINS env var, or * for local dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : '*';

// Attach Socket.IO
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});
initSocket(io); // register all socket event handlers

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// API Routes
app.use('/api/execute', executeRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/extensions', extensionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeSync API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
