const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

// Use memory storage — file buffer is uploaded directly to Cloudinary
const storage = multer.memoryStorage();

// File filter — accept only PDF, JPG, JPEG, PNG
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        'Unsupported file type. Only PDF, JPG, JPEG, PNG are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

module.exports = { upload };
