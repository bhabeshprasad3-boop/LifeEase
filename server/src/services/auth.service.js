const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { sendVerificationEmail } = require('./email.service');

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Generate a JWT token for the given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Generate a random 6-digit numeric OTP and its bcrypt hash.
 * We never store the raw code in the database.
 * @returns {{ rawCode: string, hashedCode: string }}
 */
const generateOtp = async () => {
  // crypto.randomInt is synchronous and cryptographically secure
  const rawCode = String(crypto.randomInt(100000, 999999));
  const hashedCode = await bcrypt.hash(rawCode, 10);
  return { rawCode, hashedCode };
};

// ── Service functions ─────────────────────────────────────────────────────

/**
 * Register a new user.
 * Creates the account, sends a verification OTP, and returns the email.
 * Does NOT return a JWT — the user must verify first.
 * @returns {{ email: string }}
 */
const register = async ({ name, email, password }) => {
  // Check if email is already taken
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Generate OTP before creating user
  const { rawCode, hashedCode } = await generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create user (password auto-hashed by pre-save hook; isVerified defaults to false)
  const user = await User.create({
    name,
    email,
    password,
    verificationCode: hashedCode,
    verificationCodeExpiresAt: expiresAt,
  });

  // Send OTP email (fire-and-forget style — don't block registration on email failure)
  await sendVerificationEmail({ to: email, name, code: rawCode });

  // Return only the email so the frontend can redirect to the verify page
  return { email: user.email };
};

/**
 * Verify a user's email with the 6-digit OTP.
 * Marks the user as verified and clears the OTP fields.
 * Returns a JWT so the user is immediately logged in after verification.
 * @returns {{ user, token }}
 */
const verifyEmail = async ({ email, code }) => {
  // Select the hidden fields explicitly; we need them to verify
  const user = await User.findOne({ email }).select(
    '+verificationCode +verificationCodeExpiresAt'
  );

  if (!user) {
    throw ApiError.badRequest('No account found with this email address');
  }

  if (user.isVerified) {
    throw ApiError.badRequest('This email is already verified. Please log in.');
  }

  if (!user.verificationCode || !user.verificationCodeExpiresAt) {
    throw ApiError.badRequest('No verification code found. Please request a new one.');
  }

  // Check expiry
  if (new Date() > user.verificationCodeExpiresAt) {
    throw ApiError.badRequest('Verification code has expired. Please request a new one.');
  }

  // Compare submitted code against stored hash
  const isMatch = await bcrypt.compare(code, user.verificationCode);
  if (!isMatch) {
    throw ApiError.badRequest('Invalid verification code. Please check and try again.');
  }

  // Mark verified and clear OTP fields atomically
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiresAt = undefined;
  await user.save();

  // Issue JWT so the user is logged in right away
  const token = generateToken(user._id);
  return { user, token };
};

/**
 * Resend verification OTP.
 * Generates a fresh code, updates the DB, and re-sends the email.
 * @returns {{ email: string }}
 */
const resendVerificationCode = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.badRequest('No account found with this email address');
  }

  if (user.isVerified) {
    throw ApiError.badRequest('This email is already verified. Please log in.');
  }

  const { rawCode, hashedCode } = await generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Overwrite old code and reset expiry (invalidates the old OTP)
  user.verificationCode = hashedCode;
  user.verificationCodeExpiresAt = expiresAt;
  await user.save();

  await sendVerificationEmail({ to: email, name: user.name, code: rawCode });

  return { email: user.email };
};

/**
 * Log in an existing, verified user.
 * @returns {{ user, token }}
 */
const login = async ({ email, password }) => {
  // Fetch user WITH password field (+password overrides select: false)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Block unverified users with a specific message
  if (!user.isVerified) {
    throw ApiError.forbidden(
      'Please verify your email before logging in. Check your inbox for the verification code.'
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user._id);
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

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  getCurrentUser,
  generateToken,
};
