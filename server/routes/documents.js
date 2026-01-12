/**
 * Document routes
 */

const express = require('express');
const { 
    protect, 
    upload, 
    asyncHandler, 
    validateObjectId, 
    validatePagination 
} = require('../middleware');
const {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    getDocumentStatus
} = require('../controllers/documentController');

const router = express.Router();

// @route   POST /api/documents/upload
// @desc    Upload a new document
// @access  Private
router.post(
    '/upload',
    protect,
    upload.any(),
    asyncHandler(uploadDocument)
);

// @route   GET /api/documents
// @desc    Get all documents for current user
// @access  Private
router.get(
    '/',
    protect,
    validatePagination,
    asyncHandler(getDocuments)
);

// @route   GET /api/documents/:id
// @desc    Get single document by ID
// @access  Private
router.get(
    '/:id',
    protect,
    validateObjectId('id'),
    asyncHandler(getDocument)
);

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete(
    '/:id',
    protect,
    validateObjectId('id'),
    asyncHandler(deleteDocument)
);

// @route   GET /api/documents/:id/status
// @desc    Get document processing status
// @access  Private
router.get(
    '/:id/status',
    protect,
    validateObjectId('id'),
    asyncHandler(getDocumentStatus)
);

module.exports = router;
