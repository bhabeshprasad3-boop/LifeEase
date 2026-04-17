const express = require('express');
const router = express.Router();
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  archiveDocument,
  unarchiveDocument,
  deleteDocument,
  downloadDocument,
} = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createDocumentRules, updateDocumentRules } = require('../validators/document.validator');

// All document routes require authentication
router.use(protect);

router
  .route('/')
  .post(upload.single('file'), createDocumentRules, validate, createDocument)
  .get(getDocuments);

router
  .route('/:id')
  .get(getDocumentById)
  .patch(updateDocumentRules, validate, updateDocument)
  .delete(deleteDocument);

router.patch('/:id/archive', archiveDocument);
router.patch('/:id/unarchive', unarchiveDocument);
router.get('/:id/download', downloadDocument);

module.exports = router;
