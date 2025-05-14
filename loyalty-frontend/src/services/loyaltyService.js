import api from '../utils/api';

const loyaltyService = {
  // Points Structure
  
  // Get current points structure
  getPointsStructure: async () => {
    const response = await api.get('/loyalty/points-structure');
    return response.data;
  },
  
  // Update points structure
  updatePointsStructure: async (pointsData) => {
    const response = await api.post('/loyalty/points-structure', pointsData);
    return response.data;
  },
  
  // Tiers Management
  
  // Get all tiers
  getAllTiers: async () => {
    const response = await api.get('/loyalty/tiers');
    return response.data;
  },
  
  // Get tier by ID
  getTierById: async (id) => {
    const response = await api.get(`/loyalty/tiers/${id}`);
    return response.data;
  },
  
  // Create new tier
  createTier: async (tierData) => {
    const response = await api.post('/loyalty/tiers', tierData);
    return response.data;
  },
  
  // Update tier
  updateTier: async (id, tierData) => {
    const response = await api.put(`/loyalty/tiers/${id}`, tierData);
    return response.data;
  },
  
  // Delete tier
  deleteTier: async (id) => {
    const response = await api.delete(`/loyalty/tiers/${id}`);
    return response.data;
  },
  
  // Rewards Management
  
  // Get all rewards
  getAllRewards: async () => {
    const response = await api.get('/loyalty/rewards');
    return response.data;
  },
  
  // Get reward by ID
  getRewardById: async (id) => {
    const response = await api.get(`/loyalty/rewards/${id}`);
    return response.data;
  },
  
  // Create new reward
  createReward: async (rewardData) => {
    const response = await api.post('/loyalty/rewards', rewardData);
    return response.data;
  },
  
  // Update reward
  updateReward: async (id, rewardData) => {
    const response = await api.put(`/loyalty/rewards/${id}`, rewardData);
    return response.data;
  },
  
  // Delete reward
  deleteReward: async (id) => {
    const response = await api.delete(`/loyalty/rewards/${id}`);
    return response.data;
  },
  
  // Update customer tier
  updateCustomerTier: async (customerId) => {
    const response = await api.post(`/loyalty/update-tier/${customerId}`);
    return response.data;
  }
};

export default loyaltyService;