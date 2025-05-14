const express = require('express');
const router = express.Router();
const CustomerModel = require('../models/customerModel');

// Check status by mobile or ID number
router.get('/check/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    if (!identifier) {
      return res.status(400).json({ 
        message: 'Please provide a mobile number or ID number' 
      });
    }
    
    console.log('Checking customer status with identifier:', identifier);
    
    // Try to find by mobile number first
    let customer = await CustomerModel.getByMobile(identifier);
    
    // If not found, try by ID number
    if (!customer) {
      customer = await CustomerModel.getByIdentificationNo(identifier);
    }
    
    if (!customer) {
      console.log('Customer not found with identifier:', identifier);
      return res.status(404).json({ 
        message: 'Customer not found. Please check the mobile or ID number and try again.'
      });
    }
    
    // Format customer data for response
    const customerData = {
      customer_id: customer.customer_id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      mobile: customer.mobile,
      tier: customer.tier || 'Standard',
      points: {
        available: parseInt(customer.available_points, 10) || 0,
        earned: parseInt(customer.earned_points, 10) || 0,
        redeemed: parseInt(customer.redeemed_points, 10) || 0
      },
      lifetime_spend: parseFloat(customer.lifetime_spend) || 0
    };
    
    console.log('Customer found:', customer.customer_id);
    res.json(customerData);
  } catch (error) {
    console.error('Error checking customer status:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;