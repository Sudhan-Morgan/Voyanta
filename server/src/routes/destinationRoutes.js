const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  seedDestinations
} = require('../controllers/destinationController');

// Public routes for exploring destinations
router.get('/', getDestinations);
router.post('/seed', seedDestinations);
router.get('/:id', getDestinationById);

module.exports = router;
