const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendVerification, login, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  registerRules,
  loginRules,
  verifyEmailRules,
  resendVerificationRules,
} = require('../validators/auth.validator');

// Public routes
router.post('/register',             registerRules,            validate, register);
router.post('/verify-email',         verifyEmailRules,         validate, verifyEmail);
router.post('/resend-verification',  resendVerificationRules,  validate, resendVerification);
router.post('/login',                loginRules,               validate, login);

// Private routes
router.post('/logout', protect, logout);
router.get('/me',     protect, getMe);

module.exports = router;
