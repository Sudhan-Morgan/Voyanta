const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const fs = require('fs');
const path = require('path');

// Load environment variables (supports running from root or server dir)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection check middleware (prevents 10000ms buffering timeouts when DB is offline)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is currently disconnected. Please whitelist your IP in MongoDB Atlas -> Network Access (Allow 0.0.0.0/0).'
    });
  }
  next();
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/friends', require('./src/routes/friendRoutes'));
app.use('/api/trips', require('./src/routes/tripRoutes'));
app.use('/api/destinations', require('./src/routes/destinationRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Voyanta API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Serve static client assets in production if client build exists
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexHtml = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
    next();
  });
} else {
  // Root API Welcome route when frontend is not bundled
  app.get('/', (req, res) => {
    res.send('Welcome to Voyanta API Service');
  });
}

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Voyanta Server running on http://localhost:${PORT}`);
});
