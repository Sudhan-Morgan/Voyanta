const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const ItineraryItem = require('../models/ItineraryItem');
const Expense = require('../models/Expense');

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      budget,
      currency,
      groupSize,
      interests,
      coverImage
    } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, destination, startDate, and endDate'
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after or equal to start date'
      });
    }

    // Default curated cover image if not provided
    const defaultCovers = [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ];
    const selectedCover = coverImage || defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const trip = await Trip.create({
      ownerId: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      budget: budget || 0,
      currency: currency || 'USD',
      groupSize: groupSize || 1,
      interests: interests || [],
      coverImage: selectedCover,
      status: 'planning'
    });

    // Create owner record in TripMember
    await TripMember.create({
      tripId: trip._id,
      userId: req.user._id,
      role: 'owner',
      invitationStatus: 'accepted',
      joinedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    console.error('Create Trip Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating trip'
    });
  }
};

// @desc    Get all trips for the logged-in user (owned or member)
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
  try {
    // Find all memberships for this user
    const memberships = await TripMember.find({
      userId: req.user._id,
      invitationStatus: 'accepted'
    }).select('tripId');

    const memberTripIds = memberships.map((m) => m.tripId);

    // Fetch trips where user is owner OR member
    const trips = await Trip.find({
      $or: [{ ownerId: req.user._id }, { _id: { $in: memberTripIds } }]
    })
      .populate('ownerId', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error('Get Trips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving trips'
    });
  }
};

// @desc    Get a single trip by ID
// @route   GET /api/trips/:id
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      'ownerId',
      'name email profileImage'
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check membership / ownership
    const isOwner = trip.ownerId._id.toString() === req.user._id.toString();
    const isMember = await TripMember.findOne({
      tripId: trip._id,
      userId: req.user._id,
      invitationStatus: 'accepted'
    });

    if (!isOwner && !isMember && !trip.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this trip'
      });
    }

    // Also fetch members, itinerary count, and expenses summary
    const members = await TripMember.find({ tripId: trip._id })
      .populate('userId', 'name email profileImage')
      .sort({ createdAt: 1 });

    const itineraryCount = await ItineraryItem.countDocuments({ tripId: trip._id });
    const expenses = await Expense.find({ tripId: trip._id });
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.status(200).json({
      success: true,
      trip,
      members,
      stats: {
        itineraryCount,
        expenseCount: expenses.length,
        totalSpent,
        remainingBudget: trip.budget ? trip.budget - totalSpent : 0
      }
    });
  } catch (error) {
    console.error('Get Trip Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving trip details'
    });
  }
};

// @desc    Update a trip
// @route   PATCH /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check authorization: Owner or Editor
    const isOwner = trip.ownerId.toString() === req.user._id.toString();
    const membership = await TripMember.findOne({
      tripId: trip._id,
      userId: req.user._id,
      invitationStatus: 'accepted'
    });

    if (!isOwner && (!membership || membership.role === 'viewer')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this trip'
      });
    }

    const updatableFields = [
      'title',
      'destination',
      'startDate',
      'endDate',
      'budget',
      'currency',
      'groupSize',
      'interests',
      'status',
      'coverImage',
      'isPublic'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    });

    const updatedTrip = await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Update Trip Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating trip'
    });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Only owner can delete a trip
    if (trip.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the trip owner can delete this trip'
      });
    }

    // Clean up associated itinerary items, expenses, and members
    await ItineraryItem.deleteMany({ tripId: trip._id });
    await Expense.deleteMany({ tripId: trip._id });
    await TripMember.deleteMany({ tripId: trip._id });
    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trip and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete Trip Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting trip'
    });
  }
};
