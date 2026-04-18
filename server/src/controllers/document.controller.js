const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const documentService = require('../services/document.service');

/**
 * @route   POST /api/documents
 * @desc    Create a document with file upload
 * @access  Private
 */
const createDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.createDocument(
    req.user._id,
    req.body,
    req.file
  );
  ApiResponse.created({ document: doc }, 'Document uploaded successfully').send(res);
});

/**
 * @route   GET /api/documents
 * @desc    Get all user's documents (paginated, filtered)
 * @access  Private
 */
const getDocuments = asyncHandler(async (req, res) => {
  const result = await documentService.getDocuments(req.user._id, req.query);
  ApiResponse.ok(result, 'Documents retrieved').send(res);
});

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document by ID
 * @access  Private
 */
const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await documentService.getDocumentById(
    req.user._id,
    req.params.id
  );
  ApiResponse.ok({ document: doc }, 'Document retrieved').send(res);
});

/**
 * @route   PATCH /api/documents/:id
 * @desc    Update document metadata
 * @access  Private
 */
const updateDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.updateDocument(
    req.user._id,
    req.params.id,
    req.body
  );
  ApiResponse.ok({ document: doc }, 'Document updated successfully').send(res);
});

/**
 * @route   PATCH /api/documents/:id/archive
 * @desc    Archive a document
 * @access  Private
 */
const archiveDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.archiveDocument(
    req.user._id,
    req.params.id
  );
  ApiResponse.ok({ document: doc }, 'Document archived').send(res);
});

/**
 * @route   PATCH /api/documents/:id/unarchive
 * @desc    Unarchive a document
 * @access  Private
 */
const unarchiveDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.unarchiveDocument(
    req.user._id,
    req.params.id
  );
  ApiResponse.ok({ document: doc }, 'Document unarchived').send(res);
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document and its cloud file
 * @access  Private
 */
const deleteDocument = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.user._id, req.params.id);
  ApiResponse.noContent('Document deleted successfully').send(res);
});

/**
 * @route   GET /api/documents/:id/download
 * @desc    Download a document file
 * @access  Private
 */
const downloadDocument = asyncHandler(async (req, res) => {
  const { url, filename, publicId } = await documentService.downloadDocument(
    req.user._id,
    req.params.id
  );

  const cloudinary = require('../config/cloudinary');

  try {
    // Generate authenticated download URL using Cloudinary signed URL
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: 'auto',
      sign_url: true,
      attachment: true,
    });

    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error(`Cloud fetch failed: ${response.status}`);

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Download error:', err.message);
    throw new Error('Failed to download file');
  }
});

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
