const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'voyanta_super_secret_dev_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Send 6-digit OTP for Email Verification before Account Creation
// @route   POST /api/auth/send-register-otp
// @access  Public
exports.sendRegisterOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // Generate 6-digit secure numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any previous registration OTPs for this email
    await Otp.deleteMany({ email: emailLower, purpose: 'registration' });

    // Save fresh OTP (auto-expires in 10 minutes)
    await Otp.create({
      email: emailLower,
      otp,
      purpose: 'registration',
      verified: false
    });

    console.log(`\n========================================`);
    console.log(`🔑 REGISTRATION OTP for ${emailLower}: ${otp}`);
    console.log(`========================================\n`);

    // HTML Email Template
    const htmlMessage = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Voyanta 🌍✈️</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">AI-Powered Travel Planner</p>
        </div>
        <div style="padding: 32px 28px; color: #334155; line-height: 1.6;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Email Verification Code</h2>
          <p style="font-size: 14px; margin-bottom: 12px;">Hello ${name ? name.trim() : 'Traveler'},</p>
          <p style="font-size: 14px; margin-bottom: 24px;">
            Thank you for starting your journey with Voyanta! Please enter the 6-digit verification code below to verify your email and set up your password:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: #eef2ff; border: 2px dashed #6366f1; border-radius: 12px; padding: 14px 28px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; font-family: monospace;">
                ${otp}
              </span>
            </div>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
            This code will expire in <strong>10 minutes</strong>. If you did not request this, please disregard this email.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          © ${new Date().getFullYear()} Voyanta. All rights reserved.
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: emailLower,
        subject: `Your Voyanta Verification Code: ${otp}`,
        text: `Your Voyanta registration verification code is: ${otp}. Valid for 10 minutes.`,
        html: htmlMessage
      });
    } catch (emailErr) {
      console.warn('⚠️ SMTP email sending warning (OTP still valid in console/fallback):', emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email address. Please check your inbox!',
      email: emailLower,
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {})
    });
  } catch (error) {
    console.error('Send Register OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending verification code'
    });
  }
};

// @desc    Verify 6-digit OTP entered by user
// @route   POST /api/auth/verify-register-otp
// @access  Public
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and verification code'
      });
    }

    const emailLower = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Look for matching valid OTP record
    const otpRecord = await Otp.findOne({
      email: emailLower,
      otp: cleanOtp,
      purpose: 'registration'
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please check your email or request a new code.'
      });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Generate short-lived verification token (15 mins) for password creation step
    const verificationToken = jwt.sign(
      { email: emailLower, purpose: 'email-verified' },
      process.env.JWT_SECRET || 'voyanta_super_secret_dev_key_2026',
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: 'Email successfully verified! You can now set your password.',
      verificationToken
    });
  } catch (error) {
    console.error('Verify Register OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying code'
    });
  }
};

// @desc    Register new user with password (Requires prior email verification)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, verificationToken } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailLower = email.toLowerCase().trim();

    // Enforce email verification check
    let isVerified = false;

    // Check 1: verify signed verificationToken if provided
    if (verificationToken) {
      try {
        const decoded = jwt.verify(
          verificationToken,
          process.env.JWT_SECRET || 'voyanta_super_secret_dev_key_2026'
        );
        if (decoded.email === emailLower && decoded.purpose === 'email-verified') {
          isVerified = true;
        }
      } catch (tokenErr) {
        // Fall back to database check below
      }
    }

    // Check 2: check verified OTP record in database
    if (!isVerified) {
      const verifiedOtp = await Otp.findOne({
        email: emailLower,
        purpose: 'registration',
        verified: true
      });
      if (verifiedOtp) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email verification required. Please verify your email with the 6-digit code first.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      passwordHash,
      isEmailVerified: true
    });

    // Clean up verified OTP record
    await Otp.deleteMany({ email: emailLower, purpose: 'registration' });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created and verified successfully!',
      token,
      user: {
        id: user._id,
        _id: user._id,
        userNumber: user.userNumber,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        profileImage: user.profileImage,
        favoritePlaces: user.favoritePlaces || [],
        travelPreferences: user.travelPreferences,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and include passwordHash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Ensure user has userNumber
    if (!user.userNumber) {
      user.userNumber = Math.floor(100000 + Math.random() * 900000);
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        userNumber: user.userNumber,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        profileImage: user.profileImage,
        favoritePlaces: user.favoritePlaces || [],
        travelPreferences: user.travelPreferences,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, profileImage, travelPreferences, favoritePlaces } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();

    // If email is changing, validate & ensure uniqueness
    if (email && email.toLowerCase() !== user.email) {
      const emailLower = email.toLowerCase().trim();
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(emailLower)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }
      const existingUser = await User.findOne({ email: emailLower, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered with another account' });
      }
      user.email = emailLower;
    }

    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (favoritePlaces !== undefined && Array.isArray(favoritePlaces)) {
      user.favoritePlaces = favoritePlaces;
    }

    if (travelPreferences) {
      user.travelPreferences = {
        ...user.travelPreferences,
        ...travelPreferences
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        userNumber: updatedUser.userNumber,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || '',
        profileImage: updatedUser.profileImage,
        favoritePlaces: updatedUser.favoritePlaces || [],
        travelPreferences: updatedUser.travelPreferences,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Add a place to favorites
// @route   POST /api/auth/favorite-places
// @access  Private
exports.addFavoritePlace = async (req, res) => {
  try {
    const { name, location, category, description, image, rating, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Place name is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newPlace = {
      name: name.trim(),
      location: location ? location.trim() : '',
      category: category || 'General',
      description: description ? description.trim() : '',
      image: image || '',
      rating: Number(rating) || 5,
      notes: notes ? notes.trim() : '',
      createdAt: new Date()
    };

    user.favoritePlaces.unshift(newPlace);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Place added to favorites successfully!',
      favoritePlaces: user.favoritePlaces,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        profileImage: user.profileImage,
        favoritePlaces: user.favoritePlaces,
        travelPreferences: user.travelPreferences,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Add Favorite Place Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding favorite place'
    });
  }
};

// @desc    Remove a place from favorites
// @route   DELETE /api/auth/favorite-places/:placeId
// @access  Private
exports.removeFavoritePlace = async (req, res) => {
  try {
    const { placeId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.favoritePlaces = user.favoritePlaces.filter(
      (place) => place._id.toString() !== placeId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Place removed from favorites',
      favoritePlaces: user.favoritePlaces,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        profileImage: user.profileImage,
        favoritePlaces: user.favoritePlaces,
        travelPreferences: user.travelPreferences,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Remove Favorite Place Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing favorite place'
    });
  }
};

// @desc    Forgot Password - send secure reset link via email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    // Generate and save reset token (valid for 15 minutes)
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Client reset URL (dynamically using incoming request origin or env)
    const clientOrigin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientOrigin}/reset-password/${resetToken}`;

    const htmlMessage = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Voyanta 🌍✈️</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">AI-Powered Travel Planning</p>
        </div>
        <div style="padding: 32px 28px; color: #334155; line-height: 1.6;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Hello ${user.name || 'Traveler'},</h2>
          <p style="font-size: 14px; margin-bottom: 20px;">
            We received a request to reset the password for your Voyanta account (<strong>${user.email}</strong>).
          </p>
          <p style="font-size: 14px; margin-bottom: 28px;">
            Click the button below to choose a new password. This link is secure and valid for <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
              Reset My Password →
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
            If you did not request this password reset, you can safely ignore this email. Your account remains protected.
          </p>
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; word-break: break-all;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color: #4f46e5; text-decoration: underline;">${resetUrl}</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
          © ${new Date().getFullYear()} Voyanta. All rights reserved.
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Voyanta Password',
        text: `You requested a password reset for your Voyanta account. Please use the following link to reset your password (valid for 15 minutes): ${resetUrl}`,
        html: htmlMessage
      });

      return res.status(200).json({
        success: true,
        message: `A password reset link has been sent to ${user.email}. Please check your email inbox and spam folder.`
      });
    } catch (emailError) {
      console.error('Email Delivery Failed:', emailError);
      // Clean up token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be delivered. Please check email configuration in server/.env.'
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error generating reset token' });
  }
};

// @desc    Reset Password with valid token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const crypto = require('crypto');
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash token to compare with database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Password successfully reset. You are now logged in.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        travelPreferences: user.travelPreferences,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error resetting password' });
  }
};

// @desc    Update password for authenticated user
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating password' });
  }
};

