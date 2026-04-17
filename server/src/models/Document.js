const mongoose = require('mongoose');
const { CATEGORIES, STATUSES, ALLOWED_FILE_TYPES } = require('../constants/documentStatus');
const { computeStatus } = require('../utils/status.util');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloud storage public ID is required'],
    },
    fileType: {
      type: String,
      enum: {
        values: ALLOWED_FILE_TYPES,
        message: '{VALUE} is not a supported file type',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Active',
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, archived: 1, createdAt: -1 });

// Auto-compute status before every save
documentSchema.pre('save', function (next) {
  this.status = computeStatus(this);
  next();
});

// Also update status on findOneAndUpdate operations
documentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  // Status will be recomputed in the service layer after update
  next();
});

// Clean JSON output
documentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Document', documentSchema);
