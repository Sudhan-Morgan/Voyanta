const aiService = require('../services/aiService');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const ItineraryItem = require('../models/ItineraryItem');

// @desc    Generate AI travel itinerary
// @route   POST /api/ai/generate-itinerary
// @access  Public
exports.generateItinerary = async (req, res) => {
  try {
    const { destination, duration, budget, travelStyle, travelersCount, interests } = req.body;

    if (!destination || destination.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a destination to generate an itinerary.'
      });
    }

    const itinerary = await aiService.generateItinerary({
      destination: destination.trim(),
      duration: Number(duration) || 3,
      budget: budget || 'moderate',
      travelStyle: travelStyle || 'balanced',
      travelersCount: Number(travelersCount) || 2,
      interests: Array.isArray(interests) ? interests : []
    });

    return res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('Error generating AI itinerary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary. Please try again.',
      error: error.message
    });
  }
};

// @desc    Convert and save an AI itinerary as an active Trip in user's account
// @route   POST /api/ai/save-as-trip
// @access  Private
exports.saveItineraryAsTrip = async (req, res) => {
  try {
    const { itinerary, startDate, endDate } = req.body;

    if (!itinerary || !itinerary.destination) {
      return res.status(400).json({
        success: false,
        message: 'Invalid itinerary data provided.'
      });
    }

    const durationDays = itinerary.durationDays || itinerary.days?.length || 3;
    const tripStart = startDate ? new Date(startDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tripEnd = endDate
      ? new Date(endDate)
      : new Date(tripStart.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);

    // Parse budget estimate into numeric value if possible
    let numericBudget = 50000;
    if (itinerary.estimatedTotalCost) {
      const match = itinerary.estimatedTotalCost.replace(/,/g, '').match(/\d+/);
      if (match) numericBudget = Number(match[0]);
    }

    // 1. Create the Trip
    const newTrip = await Trip.create({
      ownerId: req.user.id,
      title: itinerary.tripTitle || `${itinerary.destination} Adventure`,
      destination: itinerary.destination,
      startDate: tripStart,
      endDate: tripEnd,
      budget: numericBudget,
      currency: itinerary.currency || 'LKR',
      groupSize: itinerary.travelersCount || 1,
      interests: itinerary.highlights || [],
      coverImage: itinerary.coverImage || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
      status: 'planning',
      isPublic: false
    });

    // 2. Add owner to TripMembers
    await TripMember.create({
      tripId: newTrip._id,
      userId: req.user.id,
      role: 'owner',
      invitationStatus: 'accepted',
      joinedAt: new Date()
    });

    // 3. Populate ItineraryItems from days
    if (Array.isArray(itinerary.days)) {
      const itemsToInsert = [];

      itinerary.days.forEach((day) => {
        if (Array.isArray(day.activities)) {
          day.activities.forEach((act, idx) => {
            itemsToInsert.push({
              tripId: newTrip._id,
              dayNumber: day.dayNumber || 1,
              title: act.title,
              description: act.description || '',
              startTime: act.startTime || '',
              endTime: act.endTime || '',
              locationName: act.locationName || '',
              order: act.order || idx + 1,
              estimatedCost: Number(act.estimatedCost) || 0,
              notes: act.category ? `Category: ${act.category}` : ''
            });
          });
        }
      });

      if (itemsToInsert.length > 0) {
        await ItineraryItem.insertMany(itemsToInsert);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Itinerary successfully saved to your Trips!',
      trip: newTrip
    });
  } catch (error) {
    console.error('Error saving AI itinerary as trip:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save itinerary as trip.',
      error: error.message
    });
  }
};
