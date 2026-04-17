const cron = require('node-cron');
const { processDueReminders } = require('../services/reminder.service');

/**
 * Reminder Cron Job
 * Runs every day at 8:00 AM (server local time).
 * Checks for any unprocessed reminders that are due and dispatches them.
 */
const startReminderJob = () => {
  // Schedule: minute hour dayOfMonth month dayOfWeek
  // "0 8 * * *" = every day at 08:00
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ [Cron] Running reminder check at', new Date().toISOString());
    try {
      await processDueReminders();
    } catch (error) {
      console.error('⏰ [Cron] Reminder job error:', error.message);
    }
  });

  console.log('✓ Reminder cron job scheduled (daily at 08:00)');
};

module.exports = { startReminderJob };
