const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['uploading', 'processing', 'ready', 'error'],
        default: 'uploading'
    },
    errorMessage: {
        type: String,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date,
        default: null
    }
});

// Index for full-text search on content
documentSchema.index({ content: 'text', originalName: 'text' });

module.exports = mongoose.model('Document', documentSchema);
