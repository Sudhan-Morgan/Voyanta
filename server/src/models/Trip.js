const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a trip title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    destination: {
      type: String,
      required: [true, 'Please specify a destination'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date']
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date']
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'LKR',
      uppercase: true,
      trim: true
    },
    groupSize: {
      type: Number,
      default: 1,
      min: [1, 'Group size must be at least 1']
    },
    interests: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'completed', 'cancelled'],
      default: 'planning'
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Trip', tripSchema);
