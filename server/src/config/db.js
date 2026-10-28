const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS resolution for MongoDB Atlas SRV records on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voyanta', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.warn(`\n⚠️  MongoDB Atlas Connection Issue:`);
    console.warn(`   1. Check MongoDB Atlas -> Network Access -> Add IP Address (Allow 0.0.0.0/0 or your current IP).`);
    console.warn(`   2. Check if your Atlas cluster is Paused / Active.`);
    console.warn(`   3. Verify credentials in .env (MONGO_URI).\n`);
  }
};

module.exports = connectDB;
