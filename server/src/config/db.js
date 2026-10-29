const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS resolution for MongoDB Atlas SRV and shard records on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Fallback for dns.lookup (OS getaddrinfo) when local ISP/router DNS fails to resolve Atlas shards
const originalLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  let opt = options;
  let cb = callback;
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  }
  originalLookup(hostname, opt, (err, address, family) => {
    if (err && err.code === 'ENOTFOUND') {
      dns.resolve4(hostname, (resErr, addrs) => {
        if (!resErr && addrs && addrs.length > 0) {
          if (opt && opt.all) {
            return cb(null, addrs.map((a) => ({ address: a, family: 4 })));
          }
          return cb(null, addrs[0], 4);
        }
        return cb(err, address, family);
      });
    } else {
      cb(err, address, family);
    }
  });
};

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) return;

  isConnecting = true;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voyanta', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isConnecting = false;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.warn(`\n⚠️  MongoDB Atlas Connection Issue:`);
    console.warn(`   1. Go to MongoDB Atlas -> Network Access -> Add IP Address`);
    console.warn(`      👉 Click 'Allow Access From Anywhere' (0.0.0.0/0) to prevent IP change blocks.`);
    console.warn(`   2. Check if your Atlas cluster is Paused / Active.`);
    console.warn(`   3. Verify credentials in server/.env (MONGO_URI).\n`);

    // Auto-retry in 8 seconds
    setTimeout(connectDB, 8000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

module.exports = connectDB;
