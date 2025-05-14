const SegmentModel = require('../models/segmentModel');

const SegmentController = {
  // Create a new segment
  createSegment: async (req, res) => {
    try {
      const { segment_name, criteria } = req.body;
      
      // Validate input
      if (!segment_name || !criteria) {
        return res.status(400).json({ message: 'Segment name and criteria are required' });
      }
      
      const result = await SegmentModel.create({
        segment_name,
        criteria,
        created_by: req.user.id
      });
      
      res.status(201).json({
        message: 'Segment created successfully',
        segment_id: result.segment_id,
        customer_count: result.customer_count
      });
    } catch (error) {
      console.error('Error creating segment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get all segments
  getAllSegments: async (req, res) => {
    try {
      const segments = await SegmentModel.getAll();
      res.json(segments);
    } catch (error) {
      console.error('Error getting segments:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get segment by ID
  getSegmentById: async (req, res) => {
    try {
      const segmentId = req.params.id;
      const segment = await SegmentModel.getById(segmentId);
      
      if (!segment) {
        return res.status(404).json({ message: 'Segment not found' });
      }
      
      res.json(segment);
    } catch (error) {
      console.error('Error getting segment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Update segment
  updateSegment: async (req, res) => {
    try {
      const segmentId = req.params.id;
      const { segment_name, criteria } = req.body;
      
      // Validate input
      if (!segment_name || !criteria) {
        return res.status(400).json({ message: 'Segment name and criteria are required' });
      }
      
      // Check if segment exists
      const segment = await SegmentModel.getById(segmentId);
      if (!segment) {
        return res.status(404).json({ message: 'Segment not found' });
      }
      
      const customerCount = await SegmentModel.update(segmentId, {
        segment_name,
        criteria
      });
      
      res.json({
        message: 'Segment updated successfully',
        customer_count: customerCount
      });
    } catch (error) {
      console.error('Error updating segment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Delete segment
  deleteSegment: async (req, res) => {
    try {
      const segmentId = req.params.id;
      
      // Check if segment exists
      const segment = await SegmentModel.getById(segmentId);
      if (!segment) {
        return res.status(404).json({ message: 'Segment not found' });
      }
      
      const deleted = await SegmentModel.delete(segmentId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete segment' });
      }
      
      res.json({ message: 'Segment deleted successfully' });
    } catch (error) {
      console.error('Error deleting segment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Export segment
  exportSegment: async (req, res) => {
    try {
      const segmentId = req.params.id;
      
      // Get segment with customers
      const segment = await SegmentModel.getById(segmentId);
      if (!segment) {
        return res.status(404).json({ message: 'Segment not found' });
      }
      
      // Check if segment has customers
      if (!segment.customers || segment.customers.length === 0) {
        return res.status(404).json({ message: 'No customers found in this segment' });
      }
      
      // Format data for export
      const customers = segment.customers.map(customer => ({
        customer_id: customer.customer_id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        mobile: customer.mobile,
        address: customer.address,
        tier: customer.tier,
        available_points: customer.available_points,
        join_date: customer.join_date
      }));
      
      res.json({
        segment_name: segment.segment_name,
        created_at: segment.created_at,
        created_by: `${segment.first_name} ${segment.last_name}`,
        customer_count: segment.customer_count,
        customers
      });
    } catch (error) {
      console.error('Error exporting segment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = SegmentController;