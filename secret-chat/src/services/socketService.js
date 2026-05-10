const Message = require('../models/Message');
const Token = require('../models/Token');
const initializeFirebase = require('../config/firebase');

const admin = initializeFirebase();
let activeUsers = {};

const socketHandler = (io, socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  // Voice/Video signals
  socket.on('call-user', async ({ to, from, peerId, type }) => {
    console.log(`[Voice] call-user: ${from} → ${to}`);
    
    // Send FCM notification for "Professional" background support
    try {
      const partner = await Token.findOne({ userId: to });
      if (partner) {
        const message = {
          notification: {
            title: "Incoming Voice Call",
            body: `📞 ${from === "9492" ? "Eusebio" : "Rahitha"} is calling you...`,
          },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              click_action: "FLUTTER_NOTIFICATION_CLICK", // or your app's action
            }
          },
          token: partner.token
        };
        await admin.messaging().send(message);
        console.log(`[FCM] Call notification sent to ${to}`);
      }
    } catch (error) {
      console.error("[FCM] Error sending call notification:", error);
    }

    io.to(`voice-${to}`).emit('incoming-call', { from, peerId });
  });

  socket.on('answer-call', ({ to, peerId }) => {
    console.log(`[Voice] answer-call: → ${to}, callee peerId: ${peerId}`);
    io.to(`voice-${to}`).emit('call-accepted', { peerId });
  });

  socket.on('end-voice-call', ({ to }) => {
    console.log(`[Voice] end-voice-call → ${to}`);
    io.to(`voice-${to}`).emit('call-ended');
  });
  
  require('../../voiceSignals')(io, socket);

  socket.on('user_active', (userId) => {
    activeUsers[socket.id] = userId;
    io.emit('presence_update', Object.values(activeUsers));
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        text: data.text,
        image: data.image,
        senderId: data.senderId,
        senderName: data.senderName,
        replyTo: data.replyTo ? {
          text: data.replyTo.text || "",
          image: data.replyTo.image || null,
          senderName: data.replyTo.senderName || ""
        } : null,
        timestamp: new Date(),
        seen: false
      });

      const savedMessage = await newMessage.save();
      io.emit('receive_message', savedMessage);
    } catch (err) { 
      console.error("❌ Socket Send Message Error:", err); 
    }
  });

  socket.on('heart_ping', async (data) => {
    const senderId = data.from;
    try {
      const partner = await Token.findOne({ userId: { $ne: senderId } });

      if (partner) {
        const message = {
          notification: {
            title: "System Update",
            body: "Tap to sync settings",
          },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              vibrate_timings: ["0.2s", "0.1s", "0.2s"],
            }
          },
          token: partner.token
        };

        await admin.messaging().send(message);
        console.log('✅ FCM Heart Ping sent to partner');
      }
      socket.broadcast.emit('receive_heart_ping', data);
    } catch (error) {
      console.error("❌ FCM Error:", error);
    }
  });

  socket.on('delete_message', async (msgId) => {
    try {
      await Message.findByIdAndDelete(msgId);
      io.emit('message_deleted', msgId);
    } catch (error) {
      console.error("❌ Socket Delete Message Error:", error);
    }
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('display_typing', data);
  });

  socket.on('disconnect', () => {
    delete activeUsers[socket.id];
    io.emit('presence_update', Object.values(activeUsers));
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
};

module.exports = socketHandler;
