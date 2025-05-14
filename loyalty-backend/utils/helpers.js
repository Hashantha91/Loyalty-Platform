/**
 * Helper utility functions for the Loyalty Management System
 */

const helpers = {
    /**
     * Format currency value
     * @param {number} value - The number to format as currency
     * @param {string} currency - Currency code (default: USD)
     * @return {string} Formatted currency string
     */
    formatCurrency: (value, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(value);
    },
    
    /**
     * Format date to standard format
     * @param {string|Date} date - Date to format
     * @param {boolean} includeTime - Whether to include time in the format
     * @return {string} Formatted date string
     */
    formatDate: (date, includeTime = false) => {
      if (!date) return '';
      
      const dateObj = new Date(date);
      
      if (includeTime) {
        return dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    /**
     * Generate a random alphanumeric string
     * @param {number} length - Length of the string to generate
     * @return {string} Random string
     */
    generateRandomString: (length = 8) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return result;
    },
    
    /**
     * Calculate the next tier for a customer based on points
     * @param {number} points - Current points
     * @param {Array} tiers - Array of tier objects with threshold values
     * @return {Object} Next tier object or null if at highest tier
     */
    calculateNextTier: (points, tiers) => {
      // Sort tiers by threshold
      const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
      
      // Find current tier
      let currentTierIndex = -1;
      for (let i = 0; i < sortedTiers.length; i++) {
        if (points >= sortedTiers[i].threshold) {
          currentTierIndex = i;
        } else {
          break;
        }
      }
      
      // If at highest tier, return null
      if (currentTierIndex === sortedTiers.length - 1) {
        return null;
      }
      
      // Return next tier
      return sortedTiers[currentTierIndex + 1];
    },
    
    /**
     * Calculate points to next tier
     * @param {number} points - Current points
     * @param {Object} nextTier - Next tier object with threshold
     * @return {number} Points needed to reach next tier
     */
    pointsToNextTier: (points, nextTier) => {
      if (!nextTier) return 0;
      return Math.max(0, nextTier.threshold - points);
    },
    
    /**
     * Sanitize input to prevent SQL injection (basic version)
     * @param {string} input - String to sanitize
     * @return {string} Sanitized string
     */
    sanitizeInput: (input) => {
      if (typeof input !== 'string') return input;
      
      // Replace potentially dangerous characters
      return input
        .replace(/'/g, "''") // Escape single quotes for SQL
        .replace(/"/g, '""') // Escape double quotes
        .trim();
    },
    
    /**
     * Paginate an array of items
     * @param {Array} items - Array of items to paginate
     * @param {number} page - Current page number (1-based)
     * @param {number} pageSize - Number of items per page
     * @return {Object} Object with paginated items and pagination info
     */
    paginateItems: (items, page = 1, pageSize = 10) => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        items: items.slice(startIndex, endIndex),
        pagination: {
          totalItems: items.length,
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil(items.length / pageSize),
          hasNextPage: endIndex < items.length,
          hasPrevPage: page > 1
        }
      };
    },
    
    /**
     * Calculate tier progress percentage
     * @param {number} points - Current points
     * @param {Object} currentTier - Current tier object with threshold
     * @param {Object} nextTier - Next tier object with threshold
     * @return {number} Progress percentage (0-100)
     */
    calculateTierProgress: (points, currentTier, nextTier) => {
      if (!nextTier) return 100; // Already at highest tier
      
      const currentThreshold = currentTier ? currentTier.threshold : 0;
      const pointsForCurrentTier = points - currentThreshold;
      const pointsNeededForNextTier = nextTier.threshold - currentThreshold;
      
      const progressPercentage = Math.min(100, Math.round((pointsForCurrentTier / pointsNeededForNextTier) * 100));
      
      return progressPercentage;
    }
  };
  
  module.exports = helpers;