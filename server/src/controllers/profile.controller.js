const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  ApiResponse.ok({ user }, 'Profile retrieved').send(res);
});

/**
 * @route   PATCH /api/profile
 * @desc    Update user profile (name, avatar)
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  ApiResponse.ok({ user }, 'Profile updated successfully').send(res);
});

/**
 * @route   PATCH /api/profile/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword; // pre-save hook will hash it
  await user.save();

  ApiResponse.ok(null, 'Password changed successfully').send(res);
});

/**
 * @route   PATCH /api/profile/reminder-preferences
 * @desc    Update reminder notification preferences
 * @access  Private
 */
const updateReminderPreferences = asyncHandler(async (req, res) => {
  const { email, inApp, daysBefore } = req.body;
  const update = {};

  if (email !== undefined) update['reminderPreferences.email'] = email;
  if (inApp !== undefined) update['reminderPreferences.inApp'] = inApp;
  if (daysBefore !== undefined) update['reminderPreferences.daysBefore'] = daysBefore;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  ApiResponse.ok({ user }, 'Reminder preferences updated').send(res);
});

module.exports = { getProfile, updateProfile, changePassword, updateReminderPreferences };
