const mongoose = require('mongoose');

const tripMemberSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor'
    },
    invitationStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    invitationToken: {
      type: String
    },
    joinedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate membership for same user on same trip
tripMemberSchema.index({ tripId: 1, userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('TripMember', tripMemberSchema);
