const Token = require('../models/Token');

exports.saveToken = async (req, res) => {
  try {
    const { userId, token } = req.body;
    await Token.findOneAndUpdate(
      { userId }, 
      { token, lastActive: Date.now() }, 
      { upsert: true }
    );
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
