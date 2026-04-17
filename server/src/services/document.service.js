const Document = require('../models/Document');
const Reminder = require('../models/Reminder');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const { buildQuery } = require('../utils/query.util');
const { computeStatus } = require('../utils/status.util');

/**
 * Upload file buffer to Cloudinary and return { url, publicId }.
 */
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'lifeease/documents',
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary by publicId.
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

/**
 * Create a new document with file upload.
 */
const createDocument = async (userId, data, file) => {
  if (!file) {
    throw ApiError.badRequest('File is required');
  }

  // Upload to Cloudinary
  const { url, publicId } = await uploadToCloudinary(
    file.buffer,
    file.originalname
  );

  // Determine file type from mimetype
  const ext = file.originalname.split('.').pop().toLowerCase();

  const doc = await Document.create({
    userId,
    title: data.title,
    category: data.category,
    fileUrl: url,
    publicId,
    fileType: ext,
    tags: data.tags || [],
    notes: data.notes || '',
    issueDate: data.issueDate || null,
    expiryDate: data.expiryDate || null,
  });

  // If expiryDate is set, create reminders
  if (doc.expiryDate) {
    await createRemindersForDocument(userId, doc);
  }

  return doc;
};

/**
 * Create reminder records for a document.
 */
const createRemindersForDocument = async (userId, doc) => {
  const expiryDate = new Date(doc.expiryDate);
  const reminderDays = [
    { type: '30_days', days: 30 },
    { type: '7_days', days: 7 },
    { type: '1_day', days: 1 },
  ];

  const reminders = [];

  for (const { type, days } of reminderDays) {
    const remindAt = new Date(expiryDate);
    remindAt.setDate(remindAt.getDate() - days);

    // Only create if remind date is in the future
    if (remindAt > new Date()) {
      reminders.push({
        userId,
        documentId: doc._id,
        reminderType: type,
        remindAt,
        sent: false,
      });
    }
  }

  if (reminders.length > 0) {
    // Use insertMany with ordered:false to skip duplicates
    try {
      await Reminder.insertMany(reminders, { ordered: false });
    } catch (err) {
      // Ignore duplicate key errors (code 11000)
      if (err.code !== 11000 && !err.writeErrors) {
        throw err;
      }
    }
  }
};

/**
 * Get all documents for a user with filters, sort, pagination.
 * Also applies status filtering in-memory after fetch.
 */
const getDocuments = async (userId, queryParams) => {
  const { filter, sort, skip, limit, page } = buildQuery(queryParams, userId);
  const statusFilter = queryParams.status;

  let docs = await Document.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  // Recompute status for each document
  docs = docs.map((doc) => ({
    ...doc,
    status: computeStatus(doc),
  }));

  // Apply status filter in-memory (since status is computed)
  if (statusFilter && statusFilter !== 'All') {
    docs = docs.filter((doc) => doc.status === statusFilter);
  }

  const total = await Document.countDocuments(filter);

  return {
    documents: docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single document by ID (owned by the user).
 */
const getDocumentById = async (userId, docId) => {
  const doc = await Document.findOne({ _id: docId, userId }).lean();
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }
  doc.status = computeStatus(doc);
  return doc;
};

/**
 * Update document metadata.
 */
const updateDocument = async (userId, docId, updateData) => {
  const doc = await Document.findOne({ _id: docId, userId });
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  // Update allowed fields
  const allowedFields = [
    'title',
    'category',
    'tags',
    'notes',
    'issueDate',
    'expiryDate',
  ];
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      doc[field] = updateData[field];
    }
  }

  // Re-create reminders if expiryDate changed
  if (updateData.expiryDate !== undefined) {
    // Remove old reminders
    await Reminder.deleteMany({ documentId: doc._id });
    if (doc.expiryDate) {
      await createRemindersForDocument(userId, doc);
    }
  }

  await doc.save(); // pre-save hook will recompute status
  return doc;
};

/**
 * Archive a document.
 */
const archiveDocument = async (userId, docId) => {
  const doc = await Document.findOneAndUpdate(
    { _id: docId, userId },
    { archived: true, status: 'Archived' },
    { new: true }
  );
  if (!doc) throw ApiError.notFound('Document not found');
  return doc;
};

/**
 * Unarchive a document.
 */
const unarchiveDocument = async (userId, docId) => {
  const doc = await Document.findOne({ _id: docId, userId });
  if (!doc) throw ApiError.notFound('Document not found');

  doc.archived = false;
  doc.status = computeStatus(doc);
  await doc.save();
  return doc;
};

/**
 * Get a download URL for a document owned by the user.
 * Returns { url, filename } so the controller can issue a proper redirect.
 */
const downloadDocument = async (userId, docId) => {
  const doc = await Document.findOne({ _id: docId, userId });
  if (!doc) {
    throw ApiError.notFound('Document not found');
  }

  if (!doc.fileUrl) {
    throw ApiError.notFound('File not found. The document may be missing its stored file.');
  }

  const filename = `${doc.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}.${doc.fileType || 'bin'}`;
  return { url: doc.fileUrl, filename };
};

/**
 * Delete a document and its cloud file.
 */
const deleteDocument = async (userId, docId) => {
  const doc = await Document.findOne({ _id: docId, userId });
  if (!doc) throw ApiError.notFound('Document not found');

  // Delete from Cloudinary
  await deleteFromCloudinary(doc.publicId);

  // Delete associated reminders
  await Reminder.deleteMany({ documentId: doc._id });

  // Delete the document
  await Document.deleteOne({ _id: doc._id });

  return true;
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  archiveDocument,
  unarchiveDocument,
  deleteDocument,
  downloadDocument,
};
