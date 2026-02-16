require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// Increase limits for large Base64 strings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);

// 🔥 CRITICAL: Increase Socket.io buffer to handle image data
const io = new Server(server, { 
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8 // 100MB
});

const mongoURI = process.env.MONGO_URI; 
mongoose.connect(mongoURI)
  .then(() => console.log("Vault DB Connected"))
  .catch(err => console.error("DB Error:", err));

const MessageSchema = new mongoose.Schema({
  text: String,
  image: String, // Base64 string
  senderId: String, 
  senderName: String,
  seen: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(20).exec();
    res.json(messages.reverse()); 
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/seen', async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await Message.updateMany(
      { senderId: { $ne: userId }, seen: false }, 
      { $set: { seen: true } }
    );
    if (result.modifiedCount > 0) io.emit('messages_seen');
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

io.on('connection', (socket) => {
  console.log("User connected:", socket.id);

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
          text: data.text,
          image: data.image, 
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: new Date(),
          seen: false 
      });
      await newMessage.save();
      io.emit('receive_message', newMessage);
    } catch (err) {
      console.error("Save Error:", err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Secure Server on ${PORT}`));