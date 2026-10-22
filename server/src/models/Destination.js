const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the destination name'],
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    category: {
      type: String,
      enum: ['beach', 'nature', 'adventure', 'wildlife', 'city', 'culture', 'family', 'budget'],
      required: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    region: {
      type: String,
      default: ''
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    imageUrls: {
      type: [String],
      default: []
    },
    practicalTips: {
      type: [String],
      default: []
    },
    bestTimeToVisit: {
      type: String,
      default: 'Year-round'
    },
    averageDailyBudget: {
      type: Number,
      default: 50
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Destination', destinationSchema);
