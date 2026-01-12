/**
 * Middleware exports
 */

const { protect } = require('./auth');
const upload = require('./upload');
const { ApiError, asyncHandler, errorHandler } = require('./errorHandler');
const {
    validateRequired,
    validateQuestion,
    validateObjectId,
    validatePagination
} = require('./validate');

module.exports = {
    // Authentication
    protect,
    
    // File upload
    upload,
    
    // Error handling
    ApiError,
    asyncHandler,
    errorHandler,
    
    // Validation
    validateRequired,
    validateQuestion,
    validateObjectId,
    validatePagination
};
