require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8 
});


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 1. Add Token Database Schema
const TokenSchema = new mongoose.Schema({ userId: String, token: String });
const Token = mongoose.model('Token', TokenSchema);



mongoose.connect(process.env.MONGO_URI).then(() => console.log("Vault DB Connected"));

const MessageSchema = new mongoose.Schema({
  text: String, 
  image: String, // From old code
  senderId: String, 
  senderName: String,
  seen: { type: Boolean, default: false }, // From old code
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: -1 }).limit(50).exec();
  res.json(messages.reverse());
});

// Seen logic from old code
app.post('/seen', async (req, res) => {
  await Message.updateMany({ senderId: { $ne: req.body.userId }, seen: false }, { $set: { seen: true } });
  io.emit('messages_seen');
  res.sendStatus(200);
});

// 2. Add endpoint to save the token
app.post('/save-token', async (req, res) => {
  const { userId, token } = req.body;
  await Token.findOneAndUpdate({ userId }, { token }, { upsert: true });
  res.sendStatus(200);
});


io.on('connection', (socket) => {
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({ 
        ...data, 
        timestamp: new Date(), 
        seen: false 
      });
      await newMessage.save();
      io.emit('receive_message', newMessage);



      // --- SEND NOTIFICATION LOGIC ---
      const recipientId = data.senderId === "9492" ? "9746" : "9492"; // If Eusebio sends, send to Rahitha (and vice versa)
      const target = await Token.findOne({ userId: recipientId });
      
      if (target) {
        admin.messaging().send({
          notification: {
            title: `New Message from ${data.senderName}`,
            body: data.text || "Sent an image 📷"
          },
          token: target.token
        }).catch(e => console.log("Push failed:", e));
      }
    } catch (err) { console.error(err); }
  });


  socket.on('delete_message', async (msgId) => {
    await Message.findByIdAndDelete(msgId);
    io.emit('message_deleted', msgId);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('display_typing', data);
  });
});

server.listen(5000, () => console.log("Secure Server on 5000"));