const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// Public route to generate AI itinerary
router.post('/generate-itinerary', aiController.generateItinerary);

// Protected route to save generated itinerary as active user trip
router.post('/save-as-trip', protect, aiController.saveItineraryAsTrip);

module.exports = router;
