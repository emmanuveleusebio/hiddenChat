const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .exec();
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markSeen = async (req, res, io) => {
  try {
    const { userId } = req.body;
    await Message.updateMany(
      { senderId: { $ne: userId }, seen: false }, 
      { $set: { seen: true } }
    );
    io.emit('messages_seen');
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMessage = async (req, res, io) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    io.emit('message_deleted', id);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
