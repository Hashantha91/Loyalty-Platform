const LoyaltyModel = require('../models/loyaltyModel');
const CustomerModel = require('../models/customerModel');

const LoyaltyController = {
  // Points Structure Management
  
  // Get current points structure
  getPointsStructure: async (req, res) => {
    try {
      const pointsStructure = await LoyaltyModel.getPointsStructure();
      
      if (!pointsStructure) {
        return res.status(404).json({ message: 'Points structure not found' });
      }
      
      res.json(pointsStructure);
    } catch (error) {
      console.error('Error getting points structure:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Update points structure
  updatePointsStructure: async (req, res) => {
    try {
      const { spend_amount, points_awarded } = req.body;
      
      // Validate input
      if (spend_amount <= 0 || points_awarded <= 0) {
        return res.status(400).json({ message: 'Spend amount and points awarded must be positive values' });
      }
      
      const result = await LoyaltyModel.updatePointsStructure(spend_amount, points_awarded);
      
      res.status(201).json({
        message: 'Points structure updated successfully',
        id: result
      });
    } catch (error) {
      console.error('Error updating points structure:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Tier Management
  
  // Get all tiers
  getAllTiers: async (req, res) => {
    try {
      const tiers = await LoyaltyModel.getAllTiers();
      res.json(tiers);
    } catch (error) {
      console.error('Error getting tiers:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get tier by ID
  getTierById: async (req, res) => {
    try {
      const tierId = req.params.id;
      const tier = await LoyaltyModel.getTierById(tierId);
      
      if (!tier) {
        return res.status(404).json({ message: 'Tier not found' });
      }
      
      res.json(tier);
    } catch (error) {
      console.error('Error getting tier:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Create new tier
  createTier: async (req, res) => {
    try {
      const { tier_name, threshold, discount, description } = req.body;
      
      // Validate threshold and discount
      if (threshold < 0) {
        return res.status(400).json({ message: 'Threshold must be a non-negative value' });
      }
      
      if (discount < 0 || discount > 100) {
        return res.status(400).json({ message: 'Discount must be between 0 and 100' });
      }
      
      const tierId = await LoyaltyModel.createTier({
        tier_name,
        threshold,
        discount,
        description
      });
      
      res.status(201).json({
        message: 'Tier created successfully',
        tier_id: tierId
      });
    } catch (error) {
      console.error('Error creating tier:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Update tier
  updateTier: async (req, res) => {
    try {
      const tierId = req.params.id;
      const { tier_name, threshold, discount, description } = req.body;
      
      // Check if tier exists
      const tier = await LoyaltyModel.getTierById(tierId);
      if (!tier) {
        return res.status(404).json({ message: 'Tier not found' });
      }
      
      // Validate threshold and discount
      if (threshold < 0) {
        return res.status(400).json({ message: 'Threshold must be a non-negative value' });
      }
      
      if (discount < 0 || discount > 100) {
        return res.status(400).json({ message: 'Discount must be between 0 and 100' });
      }
      
      const updated = await LoyaltyModel.updateTier(tierId, {
        tier_name,
        threshold,
        discount,
        description
      });
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update tier' });
      }
      
      res.json({ message: 'Tier updated successfully' });
    } catch (error) {
      console.error('Error updating tier:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Delete tier
  deleteTier: async (req, res) => {
    try {
      const tierId = req.params.id;
      
      // Check if tier exists
      const tier = await LoyaltyModel.getTierById(tierId);
      if (!tier) {
        return res.status(404).json({ message: 'Tier not found' });
      }
      
      const deleted = await LoyaltyModel.deleteTier(tierId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete tier' });
      }
      
      res.json({ message: 'Tier deleted successfully' });
    } catch (error) {
      console.error('Error deleting tier:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Reward Management
  
  // Get all rewards
  getAllRewards: async (req, res) => {
    try {
      const rewards = await LoyaltyModel.getAllRewards();
      res.json(rewards);
    } catch (error) {
      console.error('Error getting rewards:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get reward by ID
  getRewardById: async (req, res) => {
    try {
      const rewardId = req.params.id;
      const reward = await LoyaltyModel.getRewardById(rewardId);
      
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }
      
      res.json(reward);
    } catch (error) {
      console.error('Error getting reward:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Create new reward
  createReward: async (req, res) => {
    try {
      const { reward_name, points_required, discount_value, description } = req.body;
      
      // Validate points required
      if (points_required <= 0) {
        return res.status(400).json({ message: 'Points required must be a positive value' });
      }
      
      const rewardId = await LoyaltyModel.createReward({
        reward_name,
        points_required,
        discount_value,
        description
      });
      
      res.status(201).json({
        message: 'Reward created successfully',
        reward_id: rewardId
      });
    } catch (error) {
      console.error('Error creating reward:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Update reward
  updateReward: async (req, res) => {
    try {
      const rewardId = req.params.id;
      const { reward_name, points_required, discount_value, description, active } = req.body;
      
      // Check if reward exists
      const reward = await LoyaltyModel.getRewardById(rewardId);
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }
      
      // Validate points required
      if (points_required <= 0) {
        return res.status(400).json({ message: 'Points required must be a positive value' });
      }
      
      const updated = await LoyaltyModel.updateReward(rewardId, {
        reward_name,
        points_required,
        discount_value,
        description,
        active: active !== undefined ? active : reward.active
      });
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update reward' });
      }
      
      res.json({ message: 'Reward updated successfully' });
    } catch (error) {
      console.error('Error updating reward:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Delete reward
  deleteReward: async (req, res) => {
    try {
      const rewardId = req.params.id;
      
      // Check if reward exists
      const reward = await LoyaltyModel.getRewardById(rewardId);
      if (!reward) {
        return res.status(404).json({ message: 'Reward not found' });
      }
      
      const deleted = await LoyaltyModel.deleteReward(rewardId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete reward' });
      }
      
      res.json({ message: 'Reward deleted successfully' });
    } catch (error) {
      console.error('Error deleting reward:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Loyalty History
  
  // Get customer loyalty history
  getCustomerLoyaltyHistory: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      
      // Check if customer exists
      const customer = await CustomerModel.getById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      const history = await LoyaltyModel.getCustomerLoyaltyHistory(customerId);
      res.json(history);
    } catch (error) {
      console.error('Error getting loyalty history:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Calculate and update customer tier
  updateCustomerTier: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      
      // Check if customer exists
      const customer = await CustomerModel.getById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Get all tiers
      const tiers = await LoyaltyModel.getAllTiers();
      if (!tiers || tiers.length === 0) {
        return res.status(404).json({ message: 'No loyalty tiers defined' });
      }
      
      // Find appropriate tier based on available points
      let newTier = tiers[0]; // Default to lowest tier
      
      for (const tier of tiers) {
        if (customer.available_points >= tier.threshold) {
          if (tier.threshold > newTier.threshold) {
            newTier = tier;
          }
        }
      }
      
      // Update customer tier
      const updated = await CustomerModel.updateTier(customerId, newTier.tier_name);
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update customer tier' });
      }
      
      res.json({
        message: 'Customer tier updated successfully',
        tier: newTier.tier_name
      });
    } catch (error) {
      console.error('Error updating customer tier:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = LoyaltyController;