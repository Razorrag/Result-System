// backend/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const { getDatabaseSchema, executeQuery } = require('./services/supabaseService');
const { processCommand } = require('./services/aiService');

const app = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  // Allow larger payloads for file uploads
  maxHttpBufferSize: 1e7 // 10 MB
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('JECRC Result System Backend is running!');
});

// --- Generic Command Handler ---
async function handleCommand(socket, command, dataPayload = null) {
  const logPrefix = `[${socket.id}]`;
  console.log(`${logPrefix} Received command: "${command}"` + (dataPayload ? ` with ${dataPayload.length} data rows.` : ''));
  
  try {
    const schema = await getDatabaseSchema();
    if (schema === null) {
      socket.emit('server:error', { message: 'Could not fetch database schema.' });
      return;
    }

    const aiResponse = await processCommand(command, schema, dataPayload);
    console.log(`${logPrefix} AI Response:`, aiResponse);

    switch (aiResponse.action) {
      case 'run_select': {
        const { data, error } = await executeQuery(aiResponse.payload);
        if (error || (data && data.error)) throw new Error(error?.message || data.error);
        socket.emit('server:query_result', { query: aiResponse.payload, data: data[0] === null ? [] : data });
        break;
      }
      case 'confirm_write':
        socket.emit('server:write_confirmation', { query: aiResponse.payload });
        break;
      case 'open_ui':
        socket.emit('server:ui_action', { view: aiResponse.payload });
        break;
      case 'error':
        socket.emit('server:error', { message: aiResponse.payload });
        break;
      default:
        throw new Error('Invalid action from AI.');
    }
  } catch (e) {
    console.error(`${logPrefix} Error processing command:`, e.message);
    socket.emit('server:error', { message: e.message });
  }
}

// --- WebSocket Real-Time Logic ---
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on('user-command', (command) => handleCommand(socket, command));
  
  socket.on('user-command-with-data', ({ command, data }) => handleCommand(socket, command, data));

  socket.on('execute-confirmed-write', async ({ query }) => { /* ... (no change) ... */ });
  socket.on('manual-sql-execute', async ({ query }) => { /* ... (no change) ... */ });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server with WebSocket is listening on http://localhost:${port}`);
});