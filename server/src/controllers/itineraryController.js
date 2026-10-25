const ItineraryItem = require('../models/ItineraryItem');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');

// Helper to check trip access and edit permissions
const checkTripAccess = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404 };

  const isOwner = trip.ownerId.toString() === userId.toString();
  const membership = await TripMember.findOne({
    tripId,
    userId,
    invitationStatus: 'accepted'
  });

  if (!isOwner && !membership && !trip.isPublic) {
    return { error: 'Not authorized to access this trip', status: 403 };
  }

  const canEdit = isOwner || (membership && membership.role !== 'viewer');

  return { trip, isOwner, membership, canEdit };
};

// @desc    Get full itinerary for a trip
// @route   GET /api/trips/:tripId/itinerary
// @access  Private
exports.getTripItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const items = await ItineraryItem.find({ tripId }).sort({ dayNumber: 1, order: 1, startTime: 1 });

    // Calculate trip duration in days
    let totalDays = 1;
    if (access.trip.startDate && access.trip.endDate) {
      const diffTime = Math.abs(new Date(access.trip.endDate) - new Date(access.trip.startDate));
      totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }

    // Group items by dayNumber
    const groupedDays = {};
    for (let i = 1; i <= totalDays; i++) {
      groupedDays[i] = [];
    }

    items.forEach((item) => {
      if (!groupedDays[item.dayNumber]) {
        groupedDays[item.dayNumber] = [];
      }
      groupedDays[item.dayNumber].push(item);
    });

    res.status(200).json({
      success: true,
      data: {
        totalDays,
        items,
        days: groupedDays
      }
    });
  } catch (error) {
    console.error('Get Itinerary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve itinerary',
      error: error.message
    });
  }
};

// @desc    Add an activity/stop to the trip itinerary
// @route   POST /api/trips/:tripId/itinerary
// @access  Private
exports.addItineraryItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    if (!access.canEdit) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this trip itinerary' });
    }

    const {
      dayNumber,
      title,
      description,
      startTime,
      endTime,
      locationName,
      latitude,
      longitude,
      estimatedCost,
      notes
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an activity title' });
    }

    const dayNum = Number(dayNumber) || 1;

    // Get max order in this day to append
    const lastItem = await ItineraryItem.findOne({ tripId, dayNumber: dayNum }).sort({ order: -1 });
    const order = lastItem ? lastItem.order + 1 : 1;

    const newItem = await ItineraryItem.create({
      tripId,
      dayNumber: dayNum,
      title: title.trim(),
      description: description || '',
      startTime: startTime || '',
      endTime: endTime || '',
      locationName: locationName || '',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      order,
      estimatedCost: Number(estimatedCost) || 0,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Activity added to itinerary',
      data: newItem
    });
  } catch (error) {
    console.error('Add Itinerary Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add activity',
      error: error.message
    });
  }
};

// @desc    Update an itinerary item
// @route   PUT /api/trips/:tripId/itinerary/:itemId
// @access  Private
exports.updateItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    if (!access.canEdit) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this trip itinerary' });
    }

    const item = await ItineraryItem.findOne({ _id: itemId, tripId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Itinerary item not found' });
    }

    const {
      dayNumber,
      title,
      description,
      startTime,
      endTime,
      locationName,
      latitude,
      longitude,
      order,
      estimatedCost,
      notes
    } = req.body;

    if (dayNumber !== undefined) item.dayNumber = Number(dayNumber);
    if (title) item.title = title.trim();
    if (description !== undefined) item.description = description;
    if (startTime !== undefined) item.startTime = startTime;
    if (endTime !== undefined) item.endTime = endTime;
    if (locationName !== undefined) item.locationName = locationName;
    if (latitude !== undefined) item.latitude = latitude ? Number(latitude) : null;
    if (longitude !== undefined) item.longitude = longitude ? Number(longitude) : null;
    if (order !== undefined) item.order = Number(order);
    if (estimatedCost !== undefined) item.estimatedCost = Number(estimatedCost);
    if (notes !== undefined) item.notes = notes;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Activity updated',
      data: item
    });
  } catch (error) {
    console.error('Update Itinerary Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
};

// @desc    Delete an itinerary item
// @route   DELETE /api/trips/:tripId/itinerary/:itemId
// @access  Private
exports.deleteItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    if (!access.canEdit) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this trip itinerary' });
    }

    const item = await ItineraryItem.findOneAndDelete({ _id: itemId, tripId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Itinerary item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Activity removed from itinerary'
    });
  } catch (error) {
    console.error('Delete Itinerary Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove activity',
      error: error.message
    });
  }
};
