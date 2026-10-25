const express = require('express');
const router = express.Router({ mergeParams: true });
const itineraryController = require('../controllers/itineraryController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(itineraryController.getTripItinerary)
  .post(itineraryController.addItineraryItem);

router.route('/:itemId')
  .put(itineraryController.updateItineraryItem)
  .delete(itineraryController.deleteItineraryItem);

module.exports = router;
