const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/reminder.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
