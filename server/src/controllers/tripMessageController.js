const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const TripMessage = require('../models/TripMessage');

// Helper to check if user has access to trip
const verifyTripAccess = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404 };

  const isOwner = trip.ownerId.toString() === userId.toString();
  const isMember = await TripMember.findOne({
    tripId,
    userId,
    invitationStatus: 'accepted'
  });

  if (!isOwner && !isMember) {
    return { error: 'Not authorized to participate in this trip discussion', status: 403 };
  }

  return { trip, isOwner, isMember };
};

// @desc    Get all messages in trip discussion forum
// @route   GET /api/trips/:tripId/messages
// @access  Private
exports.getTripMessages = async (req, res) => {
  try {
    const { tripId } = req.params;
    const access = await verifyTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const messages = await TripMessage.find({ tripId })
      .populate('senderId', 'name email profileImage userNumber')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get Trip Messages Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve trip discussion messages'
    });
  }
};

// @desc    Post a new message in trip discussion forum
// @route   POST /api/trips/:tripId/messages
// @access  Private
exports.createTripMessage = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { message, category } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    const access = await verifyTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const newMessage = await TripMessage.create({
      tripId,
      senderId: req.user._id,
      message: message.trim(),
      category: category || 'general',
      likes: []
    });

    const populated = await TripMessage.findById(newMessage._id).populate(
      'senderId',
      'name email profileImage userNumber'
    );

    res.status(201).json({
      success: true,
      message: 'Discussion message posted',
      data: populated
    });
  } catch (error) {
    console.error('Create Trip Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post discussion message'
    });
  }
};

// @desc    Toggle like on a trip discussion message
// @route   POST /api/trips/:tripId/messages/:messageId/like
// @access  Private
exports.toggleLikeTripMessage = async (req, res) => {
  try {
    const { tripId, messageId } = req.params;
    const access = await verifyTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const message = await TripMessage.findOne({ _id: messageId, tripId });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const currentUserIdStr = req.user._id.toString();
    const hasLiked = message.likes.some((id) => id.toString() === currentUserIdStr);

    if (hasLiked) {
      message.likes = message.likes.filter((id) => id.toString() !== currentUserIdStr);
    } else {
      message.likes.push(req.user._id);
    }

    await message.save();

    res.status(200).json({
      success: true,
      likesCount: message.likes.length,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Toggle Like Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// @desc    Delete a message from trip discussion forum
// @route   DELETE /api/trips/:tripId/messages/:messageId
// @access  Private
exports.deleteTripMessage = async (req, res) => {
  try {
    const { tripId, messageId } = req.params;
    const access = await verifyTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const message = await TripMessage.findOne({ _id: messageId, tripId });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Only message author or trip owner can delete
    const isAuthor = message.senderId.toString() === req.user._id.toString();
    if (!isAuthor && !access.isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};
