/**
 * Authentication controller
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

/**
 * Format user response object
 */
const formatUserResponse = (user, includeToken = false) => {
    const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
    
    if (includeToken) {
        response.token = generateToken(user._id);
    }
    
    return response;
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw ApiError.badRequest('User already exists with this email');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password
    });

    res.status(201).json(formatUserResponse(user, true));
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    res.json(formatUserResponse(user, true));
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getProfile = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    if (!user) {
        throw ApiError.notFound('User not found');
    }
    
    res.json(formatUserResponse(user));
};

module.exports = {
    register,
    login,
    getProfile
};
