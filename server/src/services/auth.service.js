const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Generate a JWT token for the given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Register a new user.
 * @returns {{ user, token }}
 */
const register = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Create user (password is auto-hashed by pre-save hook)
  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Log in an existing user.
 * @returns {{ user, token }}
 */
const login = async ({ email, password }) => {
  // Find user WITH password field (+password overrides select: false)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user._id);

  // Remove password from returned object
  user.password = undefined;

  return { user, token };
};

/**
 * Get current authenticated user by ID.
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

module.exports = { register, login, getCurrentUser, generateToken };
