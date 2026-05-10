const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  authorId: { type: String },
  timestamp: { type: Date, default: Date.now },
  color: { type: String, default: '#8a9a8e' }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
