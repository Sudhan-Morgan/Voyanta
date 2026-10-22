const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    dayNumber: {
      type: Number,
      required: [true, 'Please provide the day number (e.g. 1, 2)'],
      min: [1, 'Day number must be at least 1']
    },
    title: {
      type: String,
      required: [true, 'Please provide an activity title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    startTime: {
      type: String, // e.g. "09:00 AM" or "09:00"
      default: ''
    },
    endTime: {
      type: String, // e.g. "11:00 AM" or "11:00"
      default: ''
    },
    locationName: {
      type: String,
      default: ''
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    order: {
      type: Number,
      default: 0
    },
    estimatedCost: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ItineraryItem', itineraryItemSchema);
