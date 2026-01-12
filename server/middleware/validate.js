/**
 * Request validation middleware
 */

const { ApiError } = require('./errorHandler');
const { SEARCH } = require('../config/constants');

/**
 * Validates required fields in request body
 */
const validateRequired = (fields) => (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
        return next(ApiError.badRequest(`Missing required fields: ${missing.join(', ')}`));
    }
    next();
};

/**
 * Validates search/question input
 */
const validateQuestion = (req, res, next) => {
    const { question } = req.body;
    
    if (!question || typeof question !== 'string') {
        return next(ApiError.badRequest('Please provide a question'));
    }
    
    const trimmed = question.trim();
    if (trimmed.length === 0) {
        return next(ApiError.badRequest('Please provide a question'));
    }
    
    if (trimmed.length < SEARCH.MIN_QUESTION_LENGTH) {
        return next(ApiError.badRequest('Question is too short. Please be more specific.'));
    }
    
    // Sanitize the question
    req.body.question = trimmed;
    next();
};

/**
 * Validates MongoDB ObjectId format
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        return next(ApiError.badRequest('Invalid ID format'));
    }
    next();
};

/**
 * Validates and sanitizes pagination parameters
 */
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    
    if (page < 1) {
        return next(ApiError.badRequest('Page must be a positive number'));
    }
    
    req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit
    };
    next();
};

module.exports = {
    validateRequired,
    validateQuestion,
    validateObjectId,
    validatePagination
};
