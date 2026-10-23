const Destination = require('../models/Destination');

// Default initial dataset for Sri Lanka
const SRI_LANKA_DESTINATIONS = [
  {
    name: 'Sigiriya (Lion Rock)',
    description: 'Ancient 5th-century rock fortress with legendary palace ruins, world-famous frescoes, mirror wall, and panoramic jungle vistas. A UNESCO World Heritage site.',
    category: 'culture',
    country: 'Sri Lanka',
    region: 'Central Province / Cultural Triangle',
    latitude: 7.9570,
    longitude: 80.7603,
    imageUrls: [
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578652197841-39e3fa7c0f18?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Climb early in the morning (7:00 AM) to avoid scorching heat and crowds.',
      'Also hike nearby Pidurangala Rock for the iconic sunrise view facing Sigiriya.',
      'Wear modest clothing for surrounding sacred grounds.'
    ],
    bestTimeToVisit: 'December to April',
    averageDailyBudget: 15000 // in LKR
  },
  {
    name: 'Ella & Nine Arch Bridge',
    description: 'Charming mountain town famous for lush green tea estates, the world-renowned colonial Nine Arch Bridge, hiking Little Adam\'s Peak, and Ravana Falls.',
    category: 'nature',
    country: 'Sri Lanka',
    region: 'Uva Province / Hill Country',
    latitude: 6.8667,
    longitude: 81.0466,
    imageUrls: [
      'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566296517009-d183b7a8c416?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Take the famous blue train from Kandy or Nuwara Eliya to Ella for one of the world\'s most scenic rail trips.',
      'Arrive at Nine Arch Bridge before 9:00 AM or 11:30 AM to catch trains passing over the viaduct.',
      'Rent a scooter to explore Ravana pool club and local waterfalls.'
    ],
    bestTimeToVisit: 'January to May',
    averageDailyBudget: 12000
  },
  {
    name: 'Mirissa & Coconut Tree Hill',
    description: 'Laid-back coastal haven celebrated for crescent golden sand beaches, thrilling blue whale watching excursions, oceanfront seafood grills, and the picturesque Coconut Tree Hill.',
    category: 'beach',
    country: 'Sri Lanka',
    region: 'Southern Province',
    latitude: 5.9483,
    longitude: 80.4716,
    imageUrls: [
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Visit Coconut Tree Hill during sunrise or sunset for postcard-perfect photography.',
      'Whale watching season runs November to April when seas are calmest.',
      'Try surfing lessons in nearby Weligama bay, just 10 minutes away.'
    ],
    bestTimeToVisit: 'November to April',
    averageDailyBudget: 14000
  },
  {
    name: 'Galle Fort',
    description: 'Magnificent 16th-century fortified citadel built by the Portuguese and Dutch, featuring cobblestone alleys, boutique cafes, artisan jewelers, and sunset ocean ramparts.',
    category: 'culture',
    country: 'Sri Lanka',
    region: 'Southern Province',
    latitude: 6.0535,
    longitude: 80.2210,
    imageUrls: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Walk along the fortress ramparts from the iconic Lighthouse to Flag Rock around 5:30 PM for sunset.',
      'Explore on foot; the inner fort is pedestrian-friendly with preserved colonial architecture.',
      'Try authentic gelato and Ceylon tea tastings in the historic quarter.'
    ],
    bestTimeToVisit: 'December to April',
    averageDailyBudget: 18000
  },
  {
    name: 'Nuwara Eliya (Little England)',
    description: 'Misty highland retreat surrounded by emerald green tea estates, colonial architecture, Gregory Lake water sports, and cascading waterfalls with cool temperate weather.',
    category: 'nature',
    country: 'Sri Lanka',
    region: 'Central Province / Highlands',
    latitude: 6.9497,
    longitude: 80.7891,
    imageUrls: [
      'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Pack warm layers; evening temperatures can drop down to 10°C.',
      'Tour a functioning Ceylon tea factory like Pedro or Damro to learn tea grading and tasting.',
      'Rent a swan pedal boat or bicycle around Lake Gregory.'
    ],
    bestTimeToVisit: 'February to May',
    averageDailyBudget: 16000
  },
  {
    name: 'Yala National Park',
    description: 'Premier wildlife sanctuary with the highest leopard density in the world, along with wild Asian elephants, sloth bears, spotted deer, and vibrant birdlife.',
    category: 'wildlife',
    country: 'Sri Lanka',
    region: 'Southern & Uva Province',
    latitude: 6.3725,
    longitude: 81.5204,
    imageUrls: [
      'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Book a 4x4 open safari jeep with an experienced tracker for early morning (5:30 AM) entry.',
      'Block 1 is most popular for leopard sightings; Block 5 has lower vehicle traffic.',
      'Wear neutral, dust-resistant safari clothing and bring a telephoto lens or binoculars.'
    ],
    bestTimeToVisit: 'February to June',
    averageDailyBudget: 25000
  },
  {
    name: 'Arugam Bay',
    description: 'World-famous crescent bay renowned as Sri Lanka\'s surfing paradise, known for legendary right-hand point breaks, relaxed beach huts, yoga shalas, and vibrant night parties.',
    category: 'adventure',
    country: 'Sri Lanka',
    region: 'Eastern Province',
    latitude: 6.8415,
    longitude: 81.8340,
    imageUrls: [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Main surfing season on the East Coast runs May through October when south-west coast has monsoon.',
      'Visit Peanut Farm or Whiskey Point for beginner to intermediate surf breaks.',
      'Take an afternoon lagoon safari at Kottukal to spot crocodiles and water monitors.'
    ],
    bestTimeToVisit: 'May to October',
    averageDailyBudget: 13000
  },
  {
    name: 'Jaffna & Casuarina Beach',
    description: 'Vibrant cultural hub of northern Sri Lanka, featuring historical Dutch fort ramparts, sacred golden Nallur Kandaswamy Kovil, Casuarina white-sand beach, and spicy crab curry.',
    category: 'culture',
    country: 'Sri Lanka',
    region: 'Northern Province',
    latitude: 9.6615,
    longitude: 80.0255,
    imageUrls: [
      'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566296517009-d183b7a8c416?auto=format&fit=crop&w=800&q=80'
    ],
    practicalTips: [
      'Dress respectfully (shoulders and knees covered; men remove shirts) when visiting Nallur Kovil.',
      'Take the ferry ride to Nainativu island to see Nagapooshani Amman Kovil and Nagadeepa Vihara.',
      'Try authentic Jaffna crab curry, mangoes, and traditional Rio Ice Cream.'
    ],
    bestTimeToVisit: 'January to September',
    averageDailyBudget: 11000
  }
];

// @desc    Get all destinations with optional category/search filter
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let destinations = await Destination.find(query).sort({ name: 1 });

    // Auto-seed if database is empty
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
    res.status(201).json({
      success: true,
      message: 'Successfully seeded Sri Lanka destinations',
      count: created.length,
      destinations: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error seeding destinations'
    });
  }
};
