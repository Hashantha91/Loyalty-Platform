const { pool } = require('../config/db');

const CustomerModel = {
  // Create a new customer
  create: async (customer) => {
    const { first_name, last_name, email, mobile, address, identification_no } = customer;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO customers (first_name, last_name, email, mobile, address, identification_no) VALUES (?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, mobile, address, identification_no]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all customers
  getAll: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get customer by ID
  getById: async (customerId) => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [customerId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get customer by email
  getByEmail: async (email) => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get customer by mobile
  getByMobile: async (mobile) => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE mobile = ?', [mobile]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get customer by identification number
  getByIdentificationNo: async (identificationNo) => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE identification_no = ?', [identificationNo]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get customer by mobile number (for lookup feature)
  getCustomerByMobile: async (mobileNumber) => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE mobile = ?', [mobileNumber]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Database error when getting customer by mobile number:', error);
      throw error;
    }
  },
  
  // Get customer by ID number (for lookup feature)
  getCustomerByIdNumber: async (idNumber) => {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE identification_no = ?', [idNumber]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Database error when getting customer by ID number:', error);
      throw error;
    }
  },
  
  // Update customer profile
  update: async (customerId, updateData) => {
    try {
      const { first_name, last_name, email, mobile, address } = updateData;
      
      const [result] = await pool.query(
        'UPDATE customers SET first_name = ?, last_name = ?, email = ?, mobile = ?, address = ? WHERE customer_id = ?',
        [first_name, last_name, email, mobile, address, customerId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Update customer points
  updatePoints: async (customerId, earnedPoints, redeemedPoints) => {
    try {
      // Get current points
      const [customer] = await pool.query('SELECT earned_points, redeemed_points FROM customers WHERE customer_id = ?', [customerId]);
      
      if (!customer[0]) {
        throw new Error('Customer not found');
      }
      
      const newEarnedPoints = customer[0].earned_points + earnedPoints;
      const newRedeemedPoints = customer[0].redeemed_points + redeemedPoints;
      const availablePoints = newEarnedPoints - newRedeemedPoints;
      
      const [result] = await pool.query(
        'UPDATE customers SET earned_points = ?, redeemed_points = ?, available_points = ? WHERE customer_id = ?',
        [newEarnedPoints, newRedeemedPoints, availablePoints, customerId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Update customer tier
  updateTier: async (customerId, tier) => {
    try {
      const [result] = await pool.query(
        'UPDATE customers SET tier = ? WHERE customer_id = ?',
        [tier, customerId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a customer
  delete: async (customerId) => {
    try {
      const [result] = await pool.query('DELETE FROM customers WHERE customer_id = ?', [customerId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = CustomerModel;