/**
 * Authentication routes
 */

const express = require('express');
const { protect, asyncHandler, validateRequired } = require('../middleware');
const { register, login, getProfile } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    validateRequired(['name', 'email', 'password']),
    asyncHandler(register)
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    validateRequired(['email', 'password']),
    asyncHandler(login)
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, asyncHandler(getProfile));

module.exports = router;
