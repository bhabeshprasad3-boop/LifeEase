const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send verification OTP
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { email: registeredEmail } = await authService.register({ name, email, password });

  ApiResponse.created(
    { email: registeredEmail, requiresVerification: true },
    'Account created. A 6-digit verification code has been sent to your email.'
  ).send(res);
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with OTP; returns JWT on success
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const { user, token } = await authService.verifyEmail({ email, code });

  ApiResponse.ok({ user, token }, 'Email verified successfully. Welcome to LifeEase!').send(res);
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification OTP to the given email
 * @access  Public
 */
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.resendVerificationCode({ email });

  ApiResponse.ok(
    { email },
    'A new verification code has been sent to your email.'
  ).send(res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Log in a verified user and return JWT
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

module.exports = { register, verifyEmail, resendVerification, login, logout, getMe };
