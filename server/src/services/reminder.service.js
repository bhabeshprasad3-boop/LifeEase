const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const Document = require('../models/Document');
const User = require('../models/User');
const { sendReminderEmail } = require('./email.service');

/**
 * Process all due reminders.
 * Called by the cron job — finds unsent reminders whose remindAt <= now,
 * creates in-app notifications, sends email if user preference allows.
 */
const processDueReminders = async () => {
  const now = new Date();

  // Find all unsent reminders that are due
  const dueReminders = await Reminder.find({
    sent: false,
    remindAt: { $lte: now },
  }).populate('documentId');

  if (dueReminders.length === 0) return;

  console.log(`⏰ Processing ${dueReminders.length} due reminder(s)...`);

  for (const reminder of dueReminders) {
    try {
      const doc = reminder.documentId;
      if (!doc || doc.archived) {
        // Document deleted or archived — mark reminder as sent and skip
        reminder.sent = true;
        reminder.sentAt = now;
        await reminder.save();
        continue;
      }

      // Get user for email preference
      const user = await User.findById(reminder.userId);
      if (!user) continue;

      const daysMap = { '30_days': 30, '7_days': 7, '1_day': 1 };
      const daysLeft = daysMap[reminder.reminderType] || 0;

      // Create in-app notification
      if (user.reminderPreferences?.inApp !== false) {
        await Notification.create({
          userId: user._id,
          documentId: doc._id,
          title: `${doc.title} — Expiring ${daysLeft <= 1 ? 'Tomorrow' : `in ${daysLeft} days`}`,
          message: `Your document "${doc.title}" is set to expire on ${new Date(doc.expiryDate).toLocaleDateString()}. Please review and renew if needed.`,
          type: 'expiry_warning',
        });
      }

      // Send email notification
      if (user.reminderPreferences?.email !== false) {
        await sendReminderEmail({
          to: user.email,
          documentTitle: doc.title,
          expiryDate: doc.expiryDate,
          daysLeft,
        });
      }

      // Mark reminder as sent
      reminder.sent = true;
      reminder.sentAt = now;
      await reminder.save();
    } catch (error) {
      console.error(`✗ Reminder processing error: ${error.message}`);
    }
  }

  console.log(`✓ Reminder processing complete.`);
};

/**
 * Get all notifications for a user.
 */
const getUserNotifications = async (userId, limit = 50) => {
  return Notification.find({ userId })
    .sort('-createdAt')
    .limit(limit)
    .populate('documentId', 'title category')
    .lean();
};

/**
 * Mark a notification as read.
 */
const markNotificationRead = async (userId, notificationId) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  if (!notif) {
    const ApiError = require('../utils/ApiError');
    throw ApiError.notFound('Notification not found');
  }
  return notif;
};

module.exports = { processDueReminders, getUserNotifications, markNotificationRead };
