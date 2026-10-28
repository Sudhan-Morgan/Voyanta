const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    isEmailVerified: {
      type: Boolean,
      default: true
    },
    userNumber: {
      type: Number,
      unique: true,
      sparse: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Do not return password by default
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    favoritePlaces: [
      {
        name: {
          type: String,
          required: [true, 'Place name is required'],
          trim: true
        },
        location: {
          type: String,
          default: '',
          trim: true
        },
        category: {
          type: String,
          default: 'General'
        },
        description: {
          type: String,
          default: '',
          trim: true
        },
        image: {
          type: String,
          default: ''
        },
        rating: {
          type: Number,
          default: 5,
          min: 1,
          max: 5
        },
        notes: {
          type: String,
          default: '',
          trim: true
        },
        visited: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    travelPreferences: {
      interests: {
        type: [String],
        default: ['culture', 'nature']
      },
      preferredPace: {
        type: String,
        enum: ['relaxed', 'moderate', 'fast-paced'],
        default: 'moderate'
      },
      budgetTier: {
        type: String,
        enum: ['budget', 'mid-range', 'luxury'],
        default: 'mid-range'
      },
      dietaryNotes: {
        type: String,
        default: ''
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure a unique 6-digit numeric User ID is assigned
userSchema.pre('save', async function (next) {
  if (!this.userNumber) {
    let candidate;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 20) {
      attempts++;
      candidate = Math.floor(100000 + Math.random() * 900000);
      const found = await mongoose.models.User.findOne({ userNumber: candidate });
      if (!found) {
        exists = false;
        this.userNumber = candidate;
      }
    }
  }
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const crypto = require('crypto');
  // Generate 20-byte random string
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and store in document
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration to 15 minutes from now
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

