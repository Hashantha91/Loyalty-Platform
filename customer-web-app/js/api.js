// API Configuration
const API_URL = 'http://localhost:5000/api';

// API Helper Functions
const api = {
  /**
   * Register a new customer
   * @param {Object} customerData - Customer registration data
   * @returns {Promise} API response
   */
  registerCustomer: async (customerData) => {
    try {
      const response = await fetch(`${API_URL}/customers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          mobile: customerData.mobile,
          address: customerData.address,
          identification_no: customerData.identificationNo
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Get customer by identifier (mobile or ID number)
   * @param {string} identifier - Customer mobile number or ID number
   * @returns {Promise} API response
   */
  getCustomerByIdentifier: async (identifier) => {
    try {
      const response = await fetch(`${API_URL}/status/check/${identifier}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Customer not found');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Get customer loyalty history
   * @param {number} customerId - Customer ID
   * @returns {Promise} API response
   */
  getCustomerLoyaltyHistory: async (customerId) => {
    try {
      const response = await fetch(`${API_URL}/loyalty/history/${customerId}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch loyalty history');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Get all loyalty tiers
   * @returns {Promise} API response
   */
  getLoyaltyTiers: async () => {
    try {
      const response = await fetch(`${API_URL}/loyalty/tiers`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch loyalty tiers');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};