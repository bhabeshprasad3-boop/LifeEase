const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

/**
 * Protect routes — verify JWT token from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authenticated. Please log in.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.jwt.secret);

    // Fetch user (without password)
    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User belonging to this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token. Please log in again.');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired. Please log in again.');
    }
    throw error;
  }
});

module.exports = { protect };
