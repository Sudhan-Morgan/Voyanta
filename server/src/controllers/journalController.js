const JournalEntry = require('../models/JournalEntry');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');

// Helper to check trip access
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
    return { error: 'Not authorized to view or edit this trip journal', status: 403 };
  }

  return { trip, isOwner, membership };
};

// @desc    Get all journal entries for a trip
// @route   GET /api/trips/:tripId/journal
// @access  Private
exports.getTripJournal = async (req, res) => {
  try {
    const { tripId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const entries = await JournalEntry.find({ tripId })
      .populate('authorId', 'name email profileImage')
      .populate('likes', 'name email profileImage')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error('Get Trip Journal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve journal entries',
      error: error.message
    });
  }
};

// @desc    Create a new journal entry / memory
// @route   POST /api/trips/:tripId/journal
// @access  Private
exports.createJournalEntry = async (req, res) => {
  try {
    const { tripId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const {
      title,
      notes,
      locationName,
      date,
      mood,
      photos,
      tags
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a title for this memory' });
    }

    if (!notes || !notes.trim()) {
      return res.status(400).json({ success: false, message: 'Please share your travel thoughts or notes' });
    }

    // Format photos array
    let formattedPhotos = [];
    if (Array.isArray(photos)) {
      formattedPhotos = photos
        .map((p) => {
          if (typeof p === 'string') return { url: p, caption: '' };
          if (p && p.url) return { url: p.url, caption: p.caption || '' };
          return null;
        })
        .filter(Boolean);
    }

    const newEntry = await JournalEntry.create({
      tripId,
      authorId: req.user._id,
      title: title.trim(),
      notes: notes.trim(),
      locationName: locationName ? locationName.trim() : (access.trip.destination || ''),
      date: date ? new Date(date) : new Date(),
      mood: mood || 'happy',
      photos: formattedPhotos,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : []
    });

    const populated = await JournalEntry.findById(newEntry._id)
      .populate('authorId', 'name email profileImage')
      .populate('likes', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Memory saved to travel journal',
      data: populated
    });
  } catch (error) {
    console.error('Create Journal Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
};

// @desc    Update a journal entry
// @route   PUT /api/trips/:tripId/journal/:entryId
// @access  Private
exports.updateJournalEntry = async (req, res) => {
  try {
    const { tripId, entryId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const entry = await JournalEntry.findOne({ _id: entryId, tripId });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    // Only author or trip owner can edit
    const isAuthor = entry.authorId.toString() === req.user._id.toString();
    if (!isAuthor && !access.isOwner) {
      return res.status(403).json({ success: false, message: 'Only the author or trip owner can edit this entry' });
    }

    const { title, notes, locationName, date, mood, photos, tags } = req.body;

    if (title) entry.title = title.trim();
    if (notes) entry.notes = notes.trim();
    if (locationName !== undefined) entry.locationName = locationName.trim();
    if (date) entry.date = new Date(date);
    if (mood) entry.mood = mood;
    if (Array.isArray(photos)) {
      entry.photos = photos
        .map((p) => {
          if (typeof p === 'string') return { url: p, caption: '' };
          if (p && p.url) return { url: p.url, caption: p.caption || '' };
          return null;
        })
        .filter(Boolean);
    }
    if (Array.isArray(tags)) {
      entry.tags = tags.map((t) => t.trim()).filter(Boolean);
    }

    await entry.save();

    const updated = await JournalEntry.findById(entry._id)
      .populate('authorId', 'name email profileImage')
      .populate('likes', 'name email profileImage');

    res.status(200).json({
      success: true,
      message: 'Journal entry updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update Journal Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update journal entry',
      error: error.message
    });
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/trips/:tripId/journal/:entryId
// @access  Private
exports.deleteJournalEntry = async (req, res) => {
  try {
    const { tripId, entryId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const entry = await JournalEntry.findOne({ _id: entryId, tripId });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    const isAuthor = entry.authorId.toString() === req.user._id.toString();
    if (!isAuthor && !access.isOwner) {
      return res.status(403).json({ success: false, message: 'Only author or trip owner can delete this entry' });
    }

    await JournalEntry.findByIdAndDelete(entryId);

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete Journal Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error.message
    });
  }
};

// @desc    Toggle like on a journal entry
// @route   PATCH /api/trips/:tripId/journal/:entryId/like
// @access  Private
exports.toggleLikeJournalEntry = async (req, res) => {
  try {
    const { tripId, entryId } = req.params;
    const access = await checkTripAccess(tripId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const entry = await JournalEntry.findOne({ _id: entryId, tripId });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = entry.likes.findIndex((id) => id.toString() === userIdStr);

    if (existingIndex > -1) {
      entry.likes.splice(existingIndex, 1);
    } else {
      entry.likes.push(req.user._id);
    }

    await entry.save();

    const updated = await JournalEntry.findById(entry._id)
      .populate('authorId', 'name email profileImage')
      .populate('likes', 'name email profileImage');

    res.status(200).json({
      success: true,
      liked: existingIndex === -1,
      likesCount: entry.likes.length,
      data: updated
    });
  } catch (error) {
    console.error('Toggle Like Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
};

