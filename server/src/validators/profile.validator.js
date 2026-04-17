const { body } = require('express-validator');

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 60 })
    .withMessage('Name cannot exceed 60 characters'),
  body('avatar').optional().trim(),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

const reminderPreferencesRules = [
  body('email').optional().isBoolean().withMessage('Email must be a boolean'),
  body('inApp').optional().isBoolean().withMessage('InApp must be a boolean'),
  body('daysBefore')
    .optional()
    .isArray()
    .withMessage('daysBefore must be an array of numbers')
    .custom((value) => {
      const valid = [1, 7, 30];
      return value.every((v) => valid.includes(v));
    })
    .withMessage('daysBefore values must be 1, 7, or 30'),
];

module.exports = {
  updateProfileRules,
  changePasswordRules,
  reminderPreferencesRules,
};
