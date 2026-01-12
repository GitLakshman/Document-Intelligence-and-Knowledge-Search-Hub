const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    documentName: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    relevanceScore: {
        type: Number,
        default: 0
    }
}, { _id: false });

const querySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    references: [referenceSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries by user
querySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Query', querySchema);
