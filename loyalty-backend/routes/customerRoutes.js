const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CustomerController = require('../controllers/customerController');
const validateRequest = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// Validation rules
const customerValidationRules = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('identification_no').notEmpty().withMessage('Identification number is required')
];

const updateValidationRules = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('address').notEmpty().withMessage('Address is required')
];

// Public routes (no authentication required)

// @route   POST api/customers/register
// @desc    Register a new customer
// @access  Public
router.post(
  '/register',
  customerValidationRules,
  validateRequest,
  CustomerController.registerCustomer
);

// @route   GET api/customers/lookup/:identifier
// @desc    Get customer by mobile or ID number (for customer web app)
// @access  Public
router.get(
  '/lookup/:identifier',
  CustomerController.getCustomerByIdentifier
);

// @route   GET api/customers/mobile/:mobile
// @desc    Get customer by mobile number
// @access  Public
router.get(
  '/mobile/:mobile',
  CustomerController.getCustomerByMobile
);

// Protected routes (authentication required)

// @route   GET api/customers
// @desc    Get all customers
// @access  Private
router.get(
  '/',
  auth,
  authorize('Administrator', 'Marketing'),
  CustomerController.getAllCustomers
);

// @route   GET api/customers/:id
// @desc    Get customer by ID
// @access  Private
router.get(
  '/:id',
  auth,
  authorize('Administrator', 'Marketing'),
  CustomerController.getCustomerById
);

// @route   PUT api/customers/:id
// @desc    Update customer profile
// @access  Private
router.put(
  '/:id',
  auth,
  authorize('Administrator', 'Marketing'),
  updateValidationRules,
  validateRequest,
  CustomerController.updateCustomer
);

// @route   DELETE api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete(
  '/:id',
  auth,
  authorize('Administrator'),
  CustomerController.deleteCustomer
);

module.exports = router;