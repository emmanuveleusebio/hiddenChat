require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const createApp = require('./src/app');
const socketHandler = require('./src/services/socketService');

// 1. Connect to Database
connectDB();

// 2. Initialize Socket.io (without server yet)
const io = new Server({
  cors: {
    origin: ["https://calc-socket.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000", "https://calc-socket-emmanuveleusebios-projects.vercel.app"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  maxHttpBufferSize: 1e8 // 100MB
});

// 3. Create Express App
const app = createApp(io);

// 4. Create HTTP Server and attach app
const server = http.createServer(app);

// 5. Attach Socket.io to server
io.attach(server);

// 6. Handle Socket Connections
io.on('connection', (socket) => socketHandler(io, socket));

// 7. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Production-ready Server running on port ${PORT}`);
});