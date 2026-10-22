const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (requires valid JWT token)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
