const express = require('express');
const router = express.Router();
const {
  sendRegisterOtp,
  verifyRegisterOtp,
  register,
  login,
  getMe,
  updateProfile,
  addFavoritePlace,
  removeFavoritePlace,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/send-register-otp', sendRegisterOtp);
router.post('/verify-register-otp', verifyRegisterOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes (requires valid JWT token)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/favorite-places', protect, addFavoritePlace);
router.delete('/favorite-places/:placeId', protect, removeFavoritePlace);
router.put('/update-password', protect, updatePassword);

module.exports = router;

