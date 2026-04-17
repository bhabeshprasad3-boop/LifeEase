const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const reminderService = require('../services/reminder.service');

/**
 * @route   GET /api/reminders
 * @desc    Get user's notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await reminderService.getUserNotifications(req.user._id);
  ApiResponse.ok({ notifications }, 'Notifications retrieved').send(res);
});

/**
 * @route   PATCH /api/reminders/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await reminderService.markNotificationRead(
    req.user._id,
    req.params.id
  );
  ApiResponse.ok({ notification }, 'Notification marked as read').send(res);
});

module.exports = { getNotifications, markAsRead };
