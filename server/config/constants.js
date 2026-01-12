/**
 * Application constants and configuration values
 */

module.exports = {
    // Rate limiting
    RATE_LIMIT: {
        MAX_REQUESTS_PER_HOUR: 20,
        CACHE_TTL_MS: 60 * 60 * 1000, // 1 hour
        MAX_CACHE_SIZE: 100
    },

    // File upload
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_MIME_TYPES: [
            'application/pdf',
            'text/plain',
            'text/markdown',
            'text/csv'
        ]
    },

    // Document processing
    DOCUMENT: {
        MAX_CONTENT_PREVIEW_LENGTH: 50000,
        EXCERPT_LENGTH: 300,
        AI_CONTEXT_LENGTH: 800,
        MAX_RELEVANT_DOCS: 3
    },

    // Search/Query
    SEARCH: {
        MIN_QUESTION_LENGTH: 5,
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100
    },

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10
    }
};
