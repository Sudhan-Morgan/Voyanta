const Destination = require('../models/Destination');
const SRI_LANKA_DESTINATIONS = require('../utils/sriLankaDestinationsData');

// Helper to ensure all Sri Lanka destinations exist in MongoDB
let isSeededChecked = false;
const ensureAllDestinationsSeeded = async () => {
  try {
    const count = await Destination.countDocuments();
    if (count < SRI_LANKA_DESTINATIONS.length) {
      for (const dest of SRI_LANKA_DESTINATIONS) {
        await Destination.findOneAndUpdate(
          { name: dest.name },
          dest,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }
    isSeededChecked = true;
  } catch (err) {
    console.error('Error auto-syncing destinations:', err);
  }
};

// @desc    Get all destinations with optional category/search filter
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = async (req, res) => {
  try {
    const { category, search } = req.query;

    if (!isSeededChecked) {
      await ensureAllDestinationsSeeded();
    }

    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { region: { $regex: s, $options: 'i' } },
        { country: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } }
      ];
    }

    let destinations = await Destination.find(query).sort({ name: 1 });

    // Fallback if none found from strict query but seed was empty
    if (destinations.length === 0 && !search && (!category || category === 'all')) {
      await Destination.deleteMany({});
      destinations = await Destination.insertMany(SRI_LANKA_DESTINATIONS);
    }

    res.status(200).json({
      success: true,
      count: destinations.length,
      destinations
    });
  } catch (error) {
    console.error('Get Destinations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving destinations'
    });
  }
};

// @desc    Get single destination by ID
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.status(200).json({
      success: true,
      destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving destination details'
    });
  }
};

// @desc    Seed or reset Sri Lanka destinations
// @route   POST /api/destinations/seed
// @access  Public
exports.seedDestinations = async (req, res) => {
  try {
    await Destination.deleteMany({});
    const created = await Destination.insertMany(SRI_LANKA_DESTINATIONS);
    isSeededChecked = true;
    res.status(201).json({
      success: true,
      message: 'Successfully seeded Sri Lanka destinations',
      count: created.length,
      destinations: created
    });
  } catch (error) {
    console.error('Seed Destinations Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding destinations'
    });
  }
};
