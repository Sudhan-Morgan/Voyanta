const express = require('express');
const router = express.Router({ mergeParams: true });
const journalController = require('../controllers/journalController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(journalController.getTripJournal)
  .post(journalController.createJournalEntry);

router.route('/:entryId')
  .put(journalController.updateJournalEntry)
  .delete(journalController.deleteJournalEntry);

router.patch('/:entryId/like', journalController.toggleLikeJournalEntry);

module.exports = router;
