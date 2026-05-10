const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ timestamp: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNote = async (req, res, io) => {
  try {
    const newNote = new Note({ content: req.body.content });
    await newNote.save();
    io.emit('note_updated');
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
