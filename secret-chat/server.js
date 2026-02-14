require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const mongoURI = process.env.MONGO_URI

// 1. Connect to MongoDB (Local or MongoDB Atlas)
mongoose.connect(mongoURI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// 2. Define Message Schema
const MessageSchema = new mongoose.Schema({
  text: String,
  sender: String, // 'me' or 'her'
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// 3. API to get old messages when the app opens
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// 4. Socket.io for Live Updates
io.on('connection', (socket) => {
  socket.on('send_message', async (data) => {
    // Save to Database
    const newMessage = new Message({ text: data.text, sender: data.sender });
    await newMessage.save();

    // Broadcast to both users
    io.emit('receive_message', newMessage);
  });
});

server.listen(5000, () => console.log('Server on port 5000'));