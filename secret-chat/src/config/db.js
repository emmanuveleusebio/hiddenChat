const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    if (retryCount > 0) {
      console.log(`Retrying connection in 5 seconds... (${retryCount} retries left)`);
      setTimeout(() => connectDB(retryCount - 1), 5000);
    } else {
      console.error("Could not connect to MongoDB after multiple attempts.");
      // Don't exit process in production unless absolutely necessary
    }
  }
};

module.exports = connectDB;
