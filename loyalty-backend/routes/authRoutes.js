const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const validateRequest = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  AuthController.login
);

// @route   POST api/auth/register
// @desc    Register a new user (Admin only)
// @access  Private
router.post(
  '/register',
  auth,
  authorize('Administrator'),
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('role').notEmpty().withMessage('Role is required')
  ],
  validateRequest,
  AuthController.register
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, AuthController.getCurrentUser);

// @route   PUT api/auth/change-password
// @desc    Change password
// @access  Private
router.put(
  '/change-password',
  auth,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  validateRequest,
  AuthController.changePassword
);

module.exports = router;