const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'voyanta_super_secret_dev_key_2026'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.userNumber) {
      let candidate;
      let exists = true;
      let attempts = 0;
      while (exists && attempts < 20) {
        attempts++;
        candidate = Math.floor(100000 + Math.random() * 900000);
        const found = await User.findOne({ userNumber: candidate });
        if (!found) {
          exists = false;
          user.userNumber = candidate;
          await User.findByIdAndUpdate(user._id, { userNumber: candidate });
        }
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth protect middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.'
    });
  }
};

module.exports = { protect };
