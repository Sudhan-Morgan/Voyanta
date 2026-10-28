const aiService = require('../services/aiService');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const ItineraryItem = require('../models/ItineraryItem');

// @desc    Generate AI travel itinerary
// @route   POST /api/ai/generate-itinerary
// @access  Public
exports.generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      duration,
      startDate,
      endDate,
      budget,
      customBudget,
      currency,
      travelStyle,
      travelersCount,
      interests
    } = req.body;

    if (!destination || destination.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a destination to generate an itinerary.'
      });
    }

    const itinerary = await aiService.generateItinerary({
      destination: destination.trim(),
      duration: Number(duration) || 3,
      startDate: startDate || null,
      endDate: endDate || null,
      budget: budget || 'moderate',
      customBudget: customBudget ? Number(customBudget) : null,
      currency: currency || 'LKR',
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
    const { itinerary, startDate, endDate, customBudget, currency, tripId } = req.body;

    if (!itinerary || !itinerary.destination) {
      return res.status(400).json({
        success: false,
        message: 'Invalid itinerary data provided.'
      });
    }

    const durationDays = itinerary.durationDays || itinerary.days?.length || 3;
    
    // Priority: Explicit startDate passed > itinerary.startDate > default +7 days
    const chosenStart = startDate || itinerary.startDate;
    const chosenEnd = endDate || itinerary.endDate;

    const tripStart = chosenStart ? new Date(chosenStart) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tripEnd = chosenEnd
      ? new Date(chosenEnd)
      : new Date(tripStart.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);

    // Determine exact budget
    let numericBudget = 50000;
    if (customBudget && Number(customBudget) > 0) {
      numericBudget = Number(customBudget);
    } else if (itinerary.customBudget && Number(itinerary.customBudget) > 0) {
      numericBudget = Number(itinerary.customBudget);
    } else if (itinerary.estimatedTotalCost) {
      const match = itinerary.estimatedTotalCost.replace(/,/g, '').match(/\d+/);
      if (match) numericBudget = Number(match[0]);
    }

    const chosenCurrency = currency || itinerary.currency || 'LKR';

    let targetTrip;

    // If tripId is passed, update that existing trip
    if (tripId) {
      targetTrip = await Trip.findOne({ _id: tripId, ownerId: req.user.id });
      if (targetTrip) {
        targetTrip.startDate = tripStart;
        targetTrip.endDate = tripEnd;
        targetTrip.budget = numericBudget;
        targetTrip.currency = chosenCurrency;
        if (itinerary.coverImage) targetTrip.coverImage = itinerary.coverImage;
        await targetTrip.save();

        // Clear existing itinerary items for this trip before inserting new AI items
        await ItineraryItem.deleteMany({ tripId: targetTrip._id });
      }
    }

    // Otherwise, create a brand new Trip
    if (!targetTrip) {
      targetTrip = await Trip.create({
        ownerId: req.user.id,
        title: itinerary.tripTitle || `${itinerary.destination} Adventure`,
        destination: itinerary.destination,
        startDate: tripStart,
        endDate: tripEnd,
        budget: numericBudget,
        currency: chosenCurrency,
        groupSize: itinerary.travelersCount || 1,
        interests: itinerary.highlights || [],
        coverImage: itinerary.coverImage || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
        status: 'planning',
        isPublic: false
      });

      // Add owner to TripMembers
      await TripMember.create({
        tripId: targetTrip._id,
        userId: req.user.id,
        role: 'owner',
        invitationStatus: 'accepted',
        joinedAt: new Date()
      });
    }

    // Populate ItineraryItems from days
    if (Array.isArray(itinerary.days)) {
      const itemsToInsert = [];

      itinerary.days.forEach((day) => {
        if (Array.isArray(day.activities)) {
          day.activities.forEach((act, idx) => {
            itemsToInsert.push({
              tripId: targetTrip._id,
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
      trip: targetTrip
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

