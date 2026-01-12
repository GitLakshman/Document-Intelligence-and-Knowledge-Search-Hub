/**
 * File upload middleware using Multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD } = require('../config/constants');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File type filter
const fileFilter = (req, file, cb) => {
    if (UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, TXT, MD, and CSV files are allowed'), false);
    }
};

// Create upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE
    }
});

module.exports = upload;
