require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8 
});

// 🔥 VAPID KEYS
const publicVapidKey = 'BCa8ewu1Ijm208I2oCUPuDppfrUIAcbKIam1zZWtrtY0rdELTpka-CT_Dqe2kUCy808DhyGPjGYjlCPPh2eYhWs';
const privateVapidKey = 'u7Wa-ROigdPYU9gSCCWq0JiPDr0nOO8sjFglXJXlDuE';
webpush.setVapidDetails('mailto:support@thereader.ai', publicVapidKey, privateVapidKey);

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Vault DB Connected"));

const MessageSchema = new mongoose.Schema({
  text: String, image: String, senderId: String, senderName: String,
  seen: { type: Boolean, default: false }, timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

let subscriptions = [];

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions = subscriptions.filter(s => s.endpoint !== subscription.endpoint);
  subscriptions.push(subscription);
  res.status(201).json({});
});

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: -1 }).limit(20).exec();
  res.json(messages.reverse());
});

app.post('/seen', async (req, res) => {
  await Message.updateMany({ senderId: { $ne: req.body.userId }, seen: false }, { $set: { seen: true } });
  io.emit('messages_seen');
  res.sendStatus(200);
});

// 🔥 SOCKET LOGIC
io.on('connection', (socket) => {
  console.log("Secure Connection:", socket.id);

  // 1. Typing Feature
  socket.on('typing', (data) => {
    socket.broadcast.emit('display_typing', data);
  });

  // 2. Unsend Feature
  socket.on('delete_message', async (msgId) => {
    try {
      await Message.findByIdAndDelete(msgId);
      io.emit('message_deleted', msgId);
    } catch (err) { console.error("Unsend Error:", err); }
  });

  // 3. Send Message
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({ ...data, timestamp: new Date(), seen: false });
      await newMessage.save();
      io.emit('receive_message', newMessage);

      const payload = JSON.stringify({ title: 'System Update', body: 'A security patch has been applied.' });
      subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(e => console.error("Push Error", e));
      });
    } catch (err) { console.error("Send Error:", err); }
  });
});

server.listen(5000, () => console.log("Vault Server on 5000"));