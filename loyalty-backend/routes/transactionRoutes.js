const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const TransactionController = require('../controllers/transactionController');
const validateRequest = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/transactions
// @desc    Record a new transaction
// @access  Private
router.post(
  '/',
  auth,
  authorize('Administrator', 'Sales'),
  [
    body('customer_id').isInt().withMessage('Customer ID must be an integer'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a non-negative number'),
    body('products').isArray({ min: 1 }).withMessage('Products must be an array with at least one item'),
    body('products.*.product_id').isInt().withMessage('Product ID must be an integer'),
    body('products.*.product_name').notEmpty().withMessage('Product name is required'),
    body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('products.*.amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number')
  ],
  validateRequest,
  TransactionController.createTransaction
);

// @route   GET api/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get(
  '/',
  auth,
  authorize('Administrator', 'Marketing'),
  TransactionController.getAllTransactions
);

// @route   GET api/transactions/:invoiceId
// @desc    Get transaction by invoice ID
// @access  Private
router.get(
  '/:invoiceId',
  auth,
  TransactionController.getTransactionByInvoiceId
);

// @route   GET api/transactions/customer/:customerId
// @desc    Get customer transactions
// @access  Private
router.get(
  '/customer/:customerId',
  auth,
  TransactionController.getCustomerTransactions
);

// @route   GET api/transactions/:invoiceId/details
// @desc    Get transaction details
// @access  Private
router.get(
  '/:invoiceId/details',
  auth,
  TransactionController.getTransactionDetails
);

module.exports = router;