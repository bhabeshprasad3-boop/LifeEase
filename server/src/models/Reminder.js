const mongoose = require('mongoose');
const { REMINDER_TYPES } = require('../constants/documentStatus');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    reminderType: {
      type: String,
      enum: {
        values: REMINDER_TYPES,
        message: '{VALUE} is not a valid reminder type',
      },
      required: true,
    },
    remindAt: {
      type: Date,
      required: true,
      index: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reminders for the same document + type
reminderSchema.index({ documentId: 1, reminderType: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);
