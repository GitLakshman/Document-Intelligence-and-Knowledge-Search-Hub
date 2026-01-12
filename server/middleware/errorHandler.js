/**
 * Centralized error handling middleware and utilities
 */

// Custom API Error class for consistent error handling
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message, details = null) {
        return new ApiError(400, message, details);
    }

    static unauthorized(message = 'Not authorized') {
        return new ApiError(401, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static tooManyRequests(message, details = null) {
        return new ApiError(429, message, details);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message);
    }

    static serviceUnavailable(message) {
        return new ApiError(503, message);
    }
}

// Async handler wrapper to catch errors in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Handle multer file size errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // Handle custom API errors
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details && { details: err.details })
        });
    }

    // Handle unexpected errors
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    ApiError,
    asyncHandler,
    errorHandler
};
