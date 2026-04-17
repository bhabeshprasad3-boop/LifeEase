const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.register({ name, email, password });

  ApiResponse.created({ user, token }, 'Account created successfully').send(res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Log in user and return JWT
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  ApiResponse.ok({ user, token }, 'Login successful').send(res);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client removes the token.
  // For a production system, implement a token blacklist with Redis.
  ApiResponse.ok(null, 'Logged out successfully').send(res);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  ApiResponse.ok({ user }, 'User retrieved successfully').send(res);
});

module.exports = { register, login, logout, getMe };
