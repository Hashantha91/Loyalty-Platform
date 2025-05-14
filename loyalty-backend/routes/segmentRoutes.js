const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const SegmentController = require('../controllers/segmentController');
const validateRequest = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// @route   POST api/segments
// @desc    Create a new segment
// @access  Private/Marketing
router.post(
  '/',
  auth,
  authorize('Administrator', 'Marketing'),
  [
    body('segment_name').notEmpty().withMessage('Segment name is required'),
    body('criteria').isObject().withMessage('Criteria must be an object')
  ],
  validateRequest,
  SegmentController.createSegment
);

// @route   GET api/segments
// @desc    Get all segments
// @access  Private/Marketing
router.get(
  '/',
  auth,
  authorize('Administrator', 'Marketing'),
  SegmentController.getAllSegments
);

// @route   GET api/segments/:id
// @desc    Get segment by ID
// @access  Private/Marketing
router.get(
  '/:id',
  auth,
  authorize('Administrator', 'Marketing'),
  SegmentController.getSegmentById
);

// @route   PUT api/segments/:id
// @desc    Update segment
// @access  Private/Marketing
router.put(
  '/:id',
  auth,
  authorize('Administrator', 'Marketing'),
  [
    body('segment_name').notEmpty().withMessage('Segment name is required'),
    body('criteria').isObject().withMessage('Criteria must be an object')
  ],
  validateRequest,
  SegmentController.updateSegment
);

// @route   DELETE api/segments/:id
// @desc    Delete segment
// @access  Private/Marketing
router.delete(
  '/:id',
  auth,
  authorize('Administrator', 'Marketing'),
  SegmentController.deleteSegment
);

// @route   GET api/segments/:id/export
// @desc    Export segment
// @access  Private/Marketing
router.get(
  '/:id/export',
  auth,
  authorize('Administrator', 'Marketing'),
  SegmentController.exportSegment
);

module.exports = router;