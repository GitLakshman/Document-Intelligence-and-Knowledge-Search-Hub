/**
 * Search routes
 */

const express = require('express');
const { 
    protect, 
    asyncHandler, 
    validateQuestion, 
    validateObjectId,
    validatePagination 
} = require('../middleware');
const {
    searchDocuments,
    getHistory,
    getQuery,
    deleteQuery,
    clearHistory,
    getRateLimitStatus
} = require('../controllers/searchController');

const router = express.Router();

// @route   POST /api/search
// @desc    Ask a question about documents
// @access  Private
router.post(
    '/',
    protect,
    validateQuestion,
    asyncHandler(searchDocuments)
);

// @route   GET /api/search/history
// @desc    Get query history for current user
// @access  Private
router.get(
    '/history',
    protect,
    validatePagination,
    asyncHandler(getHistory)
);

// @route   GET /api/search/history/:id
// @desc    Get single query by ID
// @access  Private
router.get(
    '/history/:id',
    protect,
    validateObjectId('id'),
    asyncHandler(getQuery)
);

// @route   DELETE /api/search/history/:id
// @desc    Delete a query from history
// @access  Private
router.delete(
    '/history/:id',
    protect,
    validateObjectId('id'),
    asyncHandler(deleteQuery)
);

// @route   DELETE /api/search/history
// @desc    Clear all query history
// @access  Private
router.delete(
    '/history',
    protect,
    asyncHandler(clearHistory)
);

// @route   GET /api/search/rate-limit
// @desc    Get rate limit status for current user
// @access  Private
router.get('/rate-limit', protect, getRateLimitStatus);

module.exports = router;
