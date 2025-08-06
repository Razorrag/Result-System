// backend/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const { getDatabaseSchema } = require('./services/supabaseService');
const { processCommand } = require('./services/aiService');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Create an HTTP server and attach the Express app
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from the Next.js frontend
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies

// Basic test route
app.get('/', (req, res) => {
  res.send('JECRC Result System Backend is running!');
});

// --- WebSocket Real-Time Logic ---
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // This is a placeholder for the full command loop in Phase 3.
  // You can test the connection with a simple event from the frontend.
  socket.on('test-event', (data) => {
    console.log('Received test event with data:', data);
    socket.emit('test-response', { message: 'Backend received your test event!' });
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});
// --- End WebSocket Logic ---

// Start the server
server.listen(port, () => {
  console.log(`🚀 Server with WebSocket is listening on http://localhost:${port}`);
});