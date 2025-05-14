/**
 * Example of how to update the service files to use constants and utility functions
 */
import api, { handleApiError } from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

const authService = {
  // Login user
  login: async (username, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { username, password });
      
      // Store token and user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CURRENT_USER);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Change password
  changePassword: async (current_password, new_password) => {
    try {
      const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, { 
        current_password, 
        new_password 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Register new user (admin only)
  registerUser: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER_USER, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) !== null;
  },
  
  // Get current user from localStorage
  getUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Update user in localStorage
  updateUserInStorage: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};

export default authService;