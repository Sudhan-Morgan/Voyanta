const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');
const { protect } = require('../middlewares/authMiddleware');

// All trip routes are protected with JWT
router.use(protect);

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .patch(updateTrip)
  .delete(deleteTrip);

// Nested routes for trip expenses
router.use('/:tripId/expenses', require('./expenseRoutes'));

// Nested routes for trip itinerary items
router.use('/:tripId/itinerary', require('./itineraryRoutes'));

module.exports = router;
