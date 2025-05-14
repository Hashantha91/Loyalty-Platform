const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const LoyaltyController = require('../controllers/loyaltyController');
const validateRequest = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// Points Structure Routes

// @route   GET api/loyalty/points-structure
// @desc    Get current points structure
// @access  Private
router.get(
  '/points-structure',
  auth,
  LoyaltyController.getPointsStructure
);

// @route   POST api/loyalty/points-structure
// @desc    Update points structure
// @access  Private/Admin
router.post(
  '/points-structure',
  auth,
  authorize('Administrator', 'Marketing'),
  [
    body('spend_amount').isNumeric().withMessage('Spend amount must be a number'),
    body('points_awarded').isInt({ min: 1 }).withMessage('Points awarded must be a positive integer')
  ],
  validateRequest,
  LoyaltyController.updatePointsStructure
);

// Tier Routes

// @route   GET api/loyalty/tiers
// @desc    Get all tiers
// @access  Private
router.get(
  '/tiers',
  auth,
  LoyaltyController.getAllTiers
);

// @route   GET api/loyalty/tiers/:id
// @desc    Get tier by ID
// @access  Private
router.get(
  '/tiers/:id',
  auth,
  LoyaltyController.getTierById
);

// @route   POST api/loyalty/tiers
// @desc    Create new tier
// @access  Private/Admin
router.post(
  '/tiers',
  auth,
  authorize('Administrator', 'Marketing'),
  [
    body('tier_name').notEmpty().withMessage('Tier name is required'),
    body('threshold').isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer'),
    body('discount').isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
  ],
  validateRequest,
  LoyaltyController.createTier
);

// @route   PUT api/loyalty/tiers/:id
// @desc    Update tier
// @access  Private/Admin
router.put(
  '/tiers/:id',
  auth,
  authorize('Administrator', 'Marketing'),
  [
    body('tier_name').notEmpty().withMessage('Tier name is required'),
    body('threshold').isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer'),
    body('discount').isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
  ],
  validateRequest,
  LoyaltyController.updateTier
);

// @route   DELETE api/loyalty/tiers/:id
// @desc    Delete tier
// @access  Private/Admin
router.delete(
  '/tiers/:id',
  auth,
  authorize('Administrator'),
  LoyaltyController.deleteTier
);

// Reward Routes

// @route   GET api/loyalty/rewards
// @desc    Get all rewards
// @access  Private
router.get(
  '/rewards',
  auth,
  LoyaltyController.getAllRewards
);

// @route   GET api/loyalty/rewards/:id
// @desc    Get reward by ID
// @access  Private
router.get(
  '/rewards/:id',
  auth,
  LoyaltyController.getRewardById
);

// @route   POST api/loyalty/rewards
// @desc    Create new reward
// @access  Private/Admin
router.post(
  '/rewards',
  auth,
  authorize('Administrator', 'Marketing'),
  [
    body('reward_name').notEmpty().withMessage('Reward name is required'),
    body('points_required').isInt({ min: 1 }).withMessage('Points required must be a positive integer')
  ],
  validateRequest,
  LoyaltyController.createReward
);

// @route   PUT api/loyalty/rewards/:id
// @desc    Update reward
// @access  Private/Admin
router.put(
  '/rewards/:id',
  auth,
  authorize('Administrator', 'Marketing'),
  [
    body('reward_name').notEmpty().withMessage('Reward name is required'),
    body('points_required').isInt({ min: 1 }).withMessage('Points required must be a positive integer')
  ],
  validateRequest,
  LoyaltyController.updateReward
);

// @route   DELETE api/loyalty/rewards/:id
// @desc    Delete reward
// @access  Private/Admin
router.delete(
  '/rewards/:id',
  auth,
  authorize('Administrator'),
  LoyaltyController.deleteReward
);

// Loyalty History Routes

// @route   GET api/loyalty/history/:customerId
// @desc    Get customer loyalty history
// @access  Private
router.get(
  '/history/:customerId',
  auth,
  LoyaltyController.getCustomerLoyaltyHistory
);

// @route   POST api/loyalty/update-tier/:customerId
// @desc    Calculate and update customer tier
// @access  Private
router.post(
  '/update-tier/:customerId',
  auth,
  authorize('Administrator', 'Marketing'),
  LoyaltyController.updateCustomerTier
);

module.exports = router;