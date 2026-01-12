/**
 * Document controller
 */

const path = require('path');
const Document = require('../models/Document');
const documentProcessor = require('../services/documentProcessor');
const { ApiError } = require('../middleware/errorHandler');
const { DOCUMENT, PAGINATION } = require('../config/constants');

/**
 * Process document asynchronously after upload
 */
const processDocumentAsync = async (document, filePath) => {
    try {
        const content = await documentProcessor.extractText(filePath, document.mimeType);

        document.content = content;
        document.status = 'ready';
        document.processedAt = new Date();
        await document.save();

        console.log(`✅ Document ${document._id} processed successfully`);
    } catch (error) {
        console.error(`❌ Error processing document ${document._id}:`, error);
        document.status = 'error';
        document.errorMessage = error.message;
        await document.save();
    }
};

/**
 * @desc    Upload a new document
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res) => {
    const file = req.files?.find(f => 
        f.fieldname === 'document' || f.fieldname === 'file'
    );

    if (!file) {
        throw ApiError.badRequest('Please upload a file using the "document" or "file" field');
    }

    // Create document record
    const document = await Document.create({
        user: req.user._id,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: 'processing'
    });

    // Process document asynchronously (don't await)
    processDocumentAsync(document, file.path);

    res.status(201).json({
        _id: document._id,
        originalName: document.originalName,
        status: document.status,
        uploadedAt: document.uploadedAt
    });
};

/**
 * @desc    Get all documents for current user
 * @route   GET /api/documents
 * @access  Private
 */
const getDocuments = async (req, res) => {
    const { page, limit, skip } = req.pagination || {
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        skip: 0
    };

    const documents = await Document.find({ user: req.user._id })
        .select('-content')
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Document.countDocuments({ user: req.user._id });

    res.json({
        documents,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDocuments: total
    });
};

/**
 * @desc    Get single document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
const getDocument = async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!document) {
        throw ApiError.notFound('Document not found');
    }

    // Truncate content for very large documents
    const responseData = document.toObject();
    if (responseData.content?.length > DOCUMENT.MAX_CONTENT_PREVIEW_LENGTH) {
        responseData.content = 
            responseData.content.substring(0, DOCUMENT.MAX_CONTENT_PREVIEW_LENGTH) + 
            '... [Content truncated for preview]';
    }

    res.json(responseData);
};

/**
 * @desc    Delete a document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
const deleteDocument = async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!document) {
        throw ApiError.notFound('Document not found');
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'uploads', document.filename);
    try {
        await documentProcessor.deleteFile(filePath);
    } catch (fileError) {
        console.warn(`Warning: Could not delete file ${filePath}:`, fileError.message);
    }

    // Delete from database
    await Document.deleteOne({ _id: document._id });

    res.json({ message: 'Document deleted successfully' });
};

/**
 * @desc    Get document processing status
 * @route   GET /api/documents/:id/status
 * @access  Private
 */
const getDocumentStatus = async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        user: req.user._id
    }).select('status errorMessage processedAt originalName size');

    if (!document) {
        throw ApiError.notFound('Document not found');
    }

    res.json(document);
};

module.exports = {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    getDocumentStatus
};
