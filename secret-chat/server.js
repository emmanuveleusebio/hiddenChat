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

mongoose.connect(mongoURI).then(() => console.log("DB Connected"));

const MessageSchema = new mongoose.Schema({
  text: String,
  senderId: String, // "9492" (Eusebio) or "9746" (Rahitha)
  senderName: String,
  seen: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// Mark messages as seen
app.post('/seen', async (req, res) => {
  const { userId } = req.body;
  await Message.updateMany({ senderId: { $ne: userId }, seen: false }, { seen: true });
  io.emit('messages_seen');
  res.sendStatus(200);
});

io.on('connection', (socket) => {
  socket.on('send_message', async (data) => {
    const newMessage = new Message(data);
    await newMessage.save();
    io.emit('receive_message', newMessage);
  });
});

server.listen(5000, () => console.log('Production Server on 5000'));