const { body } = require('express-validator');
const { CATEGORIES } = require('../constants/documentStatus');

const createDocumentRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Document title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('tags')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.split(',').map((t) => t.trim()).filter(Boolean);
      }
      return value || [];
    }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
  body('issueDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Issue date must be a valid date'),
  body('expiryDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

const updateDocumentRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('tags')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value.split(',').map((t) => t.trim()).filter(Boolean);
      }
      return value || [];
    }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
  body('issueDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Issue date must be a valid date'),
  body('expiryDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

module.exports = { createDocumentRules, updateDocumentRules };
