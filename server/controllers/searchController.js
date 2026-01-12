/**
 * Search controller
 */

const Document = require('../models/Document');
const Query = require('../models/Query');
const aiService = require('../services/aiService');
const { ApiError } = require('../middleware/errorHandler');
const { SEARCH } = require('../config/constants');

/**
 * @desc    Ask a question about documents
 * @route   POST /api/search
 * @access  Private
 */
const searchDocuments = async (req, res) => {
    const { question, documentIds } = req.body;

    // Build document query
    const documentQuery = {
        user: req.user._id,
        status: 'ready'
    };

    // Filter by specific document IDs if provided
    if (Array.isArray(documentIds) && documentIds.length > 0) {
        documentQuery._id = { $in: documentIds };
    }

    // Get documents
    const documents = await Document.find(documentQuery);

    if (documents.length === 0) {
        throw ApiError.badRequest(
            'No processed documents found. Please upload a document to get started.'
        );
    }

    // Find relevant documents
    const relevantDocs = aiService.findRelevantDocuments(documents, question);

    // Generate answer using AI
    const { answer, references, cached, remainingQueries } = await aiService.generateAnswer(
        question,
        relevantDocs,
        req.user._id.toString()
    );

    // Save query to history
    const query = await Query.create({
        user: req.user._id,
        question,
        answer,
        references
    });

    res.json({
        _id: query._id,
        question: query.question,
        answer: query.answer,
        references: query.references,
        createdAt: query.createdAt,
        cached: cached || false,
        remainingQueries
    });
};

/**
 * @desc    Get query history for current user
 * @route   GET /api/search/history
 * @access  Private
 */
const getHistory = async (req, res) => {
    const { page, limit, skip } = req.pagination || {
        page: 1,
        limit: SEARCH.DEFAULT_PAGE_SIZE,
        skip: 0
    };

    const queries = await Query.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Query.countDocuments({ user: req.user._id });

    res.json({
        queries,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalQueries: total
    });
};

/**
 * @desc    Get single query by ID
 * @route   GET /api/search/history/:id
 * @access  Private
 */
const getQuery = async (req, res) => {
    const query = await Query.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!query) {
        throw ApiError.notFound('Query not found');
    }

    res.json(query);
};

/**
 * @desc    Delete a query from history
 * @route   DELETE /api/search/history/:id
 * @access  Private
 */
const deleteQuery = async (req, res) => {
    const query = await Query.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!query) {
        throw ApiError.notFound('Query not found');
    }

    res.json({ message: 'Query deleted successfully' });
};

/**
 * @desc    Clear all query history
 * @route   DELETE /api/search/history
 * @access  Private
 */
const clearHistory = async (req, res) => {
    await Query.deleteMany({ user: req.user._id });
    res.json({ message: 'Query history cleared successfully' });
};

/**
 * @desc    Get rate limit status
 * @route   GET /api/search/rate-limit
 * @access  Private
 */
const getRateLimitStatus = (req, res) => {
    const status = aiService.getRateLimitStatus(req.user._id.toString());
    res.json({
        remaining: status.remaining,
        limit: 20,
        resetInMinutes: status.resetIn
    });
};

module.exports = {
    searchDocuments,
    getHistory,
    getQuery,
    deleteQuery,
    clearHistory,
    getRateLimitStatus
};
