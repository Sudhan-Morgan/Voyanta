const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripInvitations,
  inviteFriendToTrip,
  respondTripInvitation,
  removeTripMember
} = require('../controllers/tripController');
const { protect } = require('../middlewares/authMiddleware');

// All trip routes are protected with JWT
router.use(protect);

// Specific named routes first
router.get('/invitations', getTripInvitations);

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .patch(updateTrip)
  .delete(deleteTrip);

// Trip member invitations and management
router.post('/:id/invite', inviteFriendToTrip);
router.put('/:id/invitation/respond', respondTripInvitation);
router.delete('/:id/members/:memberId', removeTripMember);

// Nested routes for trip discussion forum messages
router.use('/:tripId/messages', require('./tripMessageRoutes'));

// Nested routes for trip expenses
router.use('/:tripId/expenses', require('./expenseRoutes'));

// Nested routes for trip itinerary items
router.use('/:tripId/itinerary', require('./itineraryRoutes'));

module.exports = router;

