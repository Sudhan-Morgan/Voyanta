const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getTripMessages,
  createTripMessage,
  toggleLikeTripMessage,
  deleteTripMessage
} = require('../controllers/tripMessageController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTripMessages)
  .post(createTripMessage);

router.post('/:messageId/like', toggleLikeTripMessage);
router.delete('/:messageId', deleteTripMessage);

module.exports = router;
