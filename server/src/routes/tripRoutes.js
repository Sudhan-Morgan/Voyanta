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

module.exports = router;
