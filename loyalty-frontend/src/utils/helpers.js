/**
 * General helper functions for the application
 */
import { LOYALTY_TIERS, TIER_COLORS } from './constants';

/**
 * Generates a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Deep clones an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounces a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Gets color for a loyalty tier
 * @param {string} tier - Tier name
 * @returns {string} MUI color name
 */
export const getTierColor = (tier) => {
  return TIER_COLORS[tier] || 'default';
};

/**
 * Calculates tier progress percentage
 * @param {Object} customer - Customer object
 * @param {Array} tiers - Array of tier objects
 * @returns {Object} Progress information
 */
export const calculateTierProgress = (customer, tiers) => {
  if (!customer || !tiers || tiers.length === 0) {
    return {
      percentage: 0,
      pointsToNext: 0,
      currentTier: null,
      nextTier: null
    };
  }
  
  // Sort tiers by threshold
  const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
  
  // Find current tier
  const currentTierIndex = sortedTiers.findIndex(tier => tier.tier_name === customer.tier);
  
  if (currentTierIndex === -1) {
    return {
      percentage: 0,
      pointsToNext: 0,
      currentTier: sortedTiers[0],
      nextTier: sortedTiers.length > 1 ? sortedTiers[1] : null
    };
  }
  
  const currentTier = sortedTiers[currentTierIndex];
  
  // Check if this is the highest tier
  if (currentTierIndex === sortedTiers.length - 1) {
    return {
      percentage: 100,
      pointsToNext: 0,
      currentTier,
      nextTier: null
    };
  }
  
  // Calculate progress to next tier
  const nextTier = sortedTiers[currentTierIndex + 1];
  const pointsForNextTier = nextTier.threshold;
  const currentPoints = customer.available_points;
  const startPoints = currentTier.threshold;
  
  const pointsNeeded = pointsForNextTier - startPoints;
  const pointsEarned = currentPoints - startPoints;
  const progressPercentage = Math.min(100, Math.round((pointsEarned / pointsNeeded) * 100));
  const pointsToNext = Math.max(0, pointsForNextTier - currentPoints);
  
  return {
    percentage: progressPercentage,
    pointsToNext,
    currentTier,
    nextTier
  };
};

/**
 * Groups an array of objects by a key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Formats a criteria object into a readable string
 * @param {Object} criteria - Criteria object
 * @returns {string} Formatted criteria string
 */
export const formatCriteria = (criteria) => {
  if (!criteria) return 'No criteria defined';
  
  const parts = [];
  
  if (criteria.tier) {
    parts.push(`Tier: ${criteria.tier}`);
  }
  
  if (criteria.min_points) {
    parts.push(`Min Points: ${criteria.min_points}`);
  }
  
  if (criteria.max_points) {
    parts.push(`Max Points: ${criteria.max_points}`);
  }
  
  if (criteria.join_date_from) {
    const date = new Date(criteria.join_date_from);
    parts.push(`Joined After: ${date.toLocaleDateString()}`);
  }
  
  if (criteria.join_date_to) {
    const date = new Date(criteria.join_date_to);
    parts.push(`Joined Before: ${date.toLocaleDateString()}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'All Customers';
};

/**
 * Rounds a number to a specified number of decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export const roundTo = (value, decimals = 2) => {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

/**
 * Checks if a user has permission for an action
 * @param {Object} user - User object
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {boolean} Whether the user has permission
 */
export const hasPermission = (user, allowedRoles) => {
  if (!user || !allowedRoles) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Capitalizes the first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

/**
 * Gets initials from a name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials
 */
export const getInitials = (firstName, lastName) => {
  return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
};