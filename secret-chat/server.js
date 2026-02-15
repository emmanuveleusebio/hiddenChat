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

// MongoDB Connection
const mongoURI = process.env.MONGO_URI; 
mongoose.connect(mongoURI).then(() => console.log("Vault DB Connected")).catch(err => console.log(err));

// Production Schema
const MessageSchema = new mongoose.Schema({
  text: String,
  senderId: String, 
  senderName: String,
  seen: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// API: Get history
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// API: Update Seen Status
app.post('/seen', async (req, res) => {
  const { userId } = req.body;
  // Mark messages NOT sent by this user as seen
  await Message.updateMany({ senderId: { $ne: userId }, seen: false }, { $set: { seen: true } });
  io.emit('messages_seen'); // Notify other device to update checkmarks
  res.sendStatus(200);
});

// Socket logic
io.on('connection', (socket) => {
  socket.on('send_message', async (data) => {
    const newMessage = new Message(data);
    await newMessage.save();
    io.emit('receive_message', newMessage);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Secure Server on ${PORT}`));