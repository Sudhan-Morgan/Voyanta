const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for this memory'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    notes: {
      type: String,
      required: [true, 'Please share your travel thoughts, notes or story'],
      trim: true
    },
    locationName: {
      type: String,
      default: '',
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    mood: {
      type: String,
      enum: ['excited', 'peaceful', 'adventurous', 'relaxed', 'grateful', 'romantic', 'happy'],
      default: 'happy'
    },
    photos: [
      {
        url: {
          type: String,
          required: true
        },
        caption: {
          type: String,
          default: '',
          trim: true
        }
      }
    ],
    tags: {
      type: [String],
      default: []
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);

