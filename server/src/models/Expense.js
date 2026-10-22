const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    paidByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true
    },
    category: {
      type: String,
      enum: ['transport', 'food', 'accommodation', 'activities', 'shopping', 'other'],
      default: 'other'
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the amount'],
      min: [0, 'Amount must be greater than or equal to 0']
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    splitBetween: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        shareAmount: {
          type: Number,
          default: 0
        },
        hasPaid: {
          type: Boolean,
          default: false
        }
      }
    ],
    date: {
      type: Date,
      default: Date.now
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

module.exports = mongoose.model('Expense', expenseSchema);
