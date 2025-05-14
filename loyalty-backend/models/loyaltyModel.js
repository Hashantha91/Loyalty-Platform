const { pool } = require('../config/db');

const LoyaltyModel = {
  // Points Structure Management
  
  // Get current points structure
  getPointsStructure: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM points_structure ORDER BY id DESC LIMIT 1');
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Update points structure
  updatePointsStructure: async (spendAmount, pointsAwarded) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO points_structure (spend_amount, points_awarded) VALUES (?, ?)',
        [spendAmount, pointsAwarded]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Tier Management
  
  // Get all tiers
  getAllTiers: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM loyalty_tiers ORDER BY threshold ASC');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get tier by ID
  getTierById: async (tierId) => {
    try {
      const [rows] = await pool.query('SELECT * FROM loyalty_tiers WHERE tier_id = ?', [tierId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Create new tier
  createTier: async (tierData) => {
    try {
      const { tier_name, threshold, discount, description } = tierData;
      
      const [result] = await pool.query(
        'INSERT INTO loyalty_tiers (tier_name, threshold, discount, description) VALUES (?, ?, ?, ?)',
        [tier_name, threshold, discount, description]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Update tier
  updateTier: async (tierId, tierData) => {
    try {
      const { tier_name, threshold, discount, description } = tierData;
      
      const [result] = await pool.query(
        'UPDATE loyalty_tiers SET tier_name = ?, threshold = ?, discount = ?, description = ? WHERE tier_id = ?',
        [tier_name, threshold, discount, description, tierId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete tier
  deleteTier: async (tierId) => {
    try {
      const [result] = await pool.query('DELETE FROM loyalty_tiers WHERE tier_id = ?', [tierId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Get appropriate tier for points
  getTierForPoints: async (points) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM loyalty_tiers WHERE threshold <= ? ORDER BY threshold DESC LIMIT 1',
        [points]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
  
  // Reward Management
  
  // Get all rewards
  getAllRewards: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM rewards WHERE active = true');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get reward by ID
  getRewardById: async (rewardId) => {
    try {
      const [rows] = await pool.query('SELECT * FROM rewards WHERE reward_id = ?', [rewardId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Create new reward
  createReward: async (rewardData) => {
    try {
      const { reward_name, points_required, discount_value, description } = rewardData;
      
      const [result] = await pool.query(
        'INSERT INTO rewards (reward_name, points_required, discount_value, description) VALUES (?, ?, ?, ?)',
        [reward_name, points_required, discount_value, description]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Update reward
  updateReward: async (rewardId, rewardData) => {
    try {
      const { reward_name, points_required, discount_value, description, active } = rewardData;
      
      const [result] = await pool.query(
        'UPDATE rewards SET reward_name = ?, points_required = ?, discount_value = ?, description = ?, active = ? WHERE reward_id = ?',
        [reward_name, points_required, discount_value, description, active, rewardId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete reward
  deleteReward: async (rewardId) => {
    try {
      const [result] = await pool.query('DELETE FROM rewards WHERE reward_id = ?', [rewardId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Loyalty History Management
  
  // Get loyalty history for customer
  getCustomerLoyaltyHistory: async (customerId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM loyalty_history WHERE customer_id = ? ORDER BY created_at DESC',
        [customerId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Add loyalty history record
  addLoyaltyHistory: async (historyData) => {
    try {
      const { customer_id, invoice_id, status, points } = historyData;
      
      const [result] = await pool.query(
        'INSERT INTO loyalty_history (customer_id, invoice_id, status, points) VALUES (?, ?, ?, ?)',
        [customer_id, invoice_id, status, points]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Calculate customer tier
  calculateCustomerTier: async (customerId) => {
    try {
      // Get customer's available points
      const [customerRows] = await pool.query(
        'SELECT available_points FROM customers WHERE customer_id = ?',
        [customerId]
      );
      
      if (!customerRows[0]) {
        throw new Error('Customer not found');
      }
      
      const points = customerRows[0].available_points;
      
      // Get appropriate tier
      const tier = await this.getTierForPoints(points);
      
      if (!tier) {
        return null;
      }
      
      // Update customer tier
      const [updateResult] = await pool.query(
        'UPDATE customers SET tier = ? WHERE customer_id = ?',
        [tier.tier_name, customerId]
      );
      
      return tier;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = LoyaltyModel;