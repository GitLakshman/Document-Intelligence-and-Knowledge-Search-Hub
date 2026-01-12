/**
 * Document Intelligence Hub - Server Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Database and services
const connectDB = require('./config/db');
const aiService = require('./services/aiService');

// Routes
const { authRoutes, documentRoutes, searchRoutes } = require('./routes');

// Middleware
const { errorHandler } = require('./middleware');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize AI service
aiService.initialize();

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API info route
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the Document Intelligence Hub API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            documents: '/api/documents',
            search: '/api/search'
        }
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Document Intelligence Hub API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found' 
    });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Document Intelligence Hub API ready`);
});

module.exports = app;
