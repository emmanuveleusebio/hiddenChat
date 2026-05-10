const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  image: String,
  senderId: { type: String, required: true },
  senderName: String,
  seen: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  replyTo: {
    text: { type: String, default: "" },
    image: { type: String, default: null },
    senderName: { type: String, default: "" }
  },
  // Added for production:
  expiresAt: { type: Date }, // For self-destructing messages
  isEncrypted: { type: Boolean, default: false }
}, { 
  minimize: false,
  timestamps: true 
});

module.exports = mongoose.model('Message', MessageSchema);
