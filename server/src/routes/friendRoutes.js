const express = require('express');
const router = express.Router();
const {
  getFriends,
  searchUsers,
  sendFriendRequest,
  respondFriendRequest,
  removeFriend
} = require('../controllers/friendController');
const { protect } = require('../middlewares/authMiddleware');

// All friend routes require authentication
router.use(protect);

router.get('/', getFriends);
router.get('/search', searchUsers);
router.post('/request', sendFriendRequest);
router.put('/requests/:id/respond', respondFriendRequest);
router.delete('/:id', removeFriend);

module.exports = router;
