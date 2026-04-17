const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  updateReminderPreferences,
} = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  updateProfileRules,
  changePasswordRules,
  reminderPreferencesRules,
} = require('../validators/profile.validator');

router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfileRules, validate, updateProfile);
router.patch('/change-password', changePasswordRules, validate, changePassword);
router.patch('/reminder-preferences', reminderPreferencesRules, validate, updateReminderPreferences);

module.exports = router;
