/**
 * Constants for the loyalty management application
 */

// API endpoint paths
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER_USER: '/auth/register',
    CURRENT_USER: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    
    // Customers
    CUSTOMERS: '/customers',
    CUSTOMER_BY_ID: (id) => `/customers/${id}`,
    CUSTOMER_BY_MOBILE: (mobile) => `/customers/mobile/${mobile}`,
    REGISTER_CUSTOMER: '/customers/register',
    
    // Loyalty
    POINTS_STRUCTURE: '/loyalty/points-structure',
    TIERS: '/loyalty/tiers',
    TIER_BY_ID: (id) => `/loyalty/tiers/${id}`,
    REWARDS: '/loyalty/rewards',
    REWARD_BY_ID: (id) => `/loyalty/rewards/${id}`,
    LOYALTY_HISTORY: (customerId) => `/loyalty/history/${customerId}`,
    UPDATE_TIER: (customerId) => `/loyalty/update-tier/${customerId}`,
    
    // Segments
    SEGMENTS: '/segments',
    SEGMENT_BY_ID: (id) => `/segments/${id}`,
    SEGMENT_EXPORT: (id) => `/segments/${id}/export`,
    
    // Transactions
    TRANSACTIONS: '/transactions',
    TRANSACTION_BY_ID: (id) => `/transactions/${id}`,
    TRANSACTION_DETAILS: (id) => `/transactions/${id}/details`,
    CUSTOMER_TRANSACTIONS: (customerId) => `/transactions/customer/${customerId}`
  };
  
  // User roles
  export const USER_ROLES = {
    ADMINISTRATOR: 'Administrator',
    MARKETING: 'Marketing',
    SALES: 'Sales'
  };
  
  // Loyalty tiers
  export const LOYALTY_TIERS = {
    PURPLE: 'Purple',
    GOLD: 'Gold',
    PLATINUM: 'Platinum'
  };
  
  // Colors for loyalty tiers
  export const TIER_COLORS = {
    [LOYALTY_TIERS.PURPLE]: 'primary',
    [LOYALTY_TIERS.GOLD]: 'secondary',
    [LOYALTY_TIERS.PLATINUM]: 'default'
  };
  
  // Loyalty point status types
  export const POINT_STATUS = {
    EARNED: 'earned',
    REDEEMED: 'redeemed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
  };
  
  // Date filter options for transactions
  export const DATE_FILTERS = {
    ALL: 'all',
    TODAY: 'today',
    WEEK: 'week',  // Last 7 days
    MONTH: 'month' // Last 30 days
  };
  
  // Form validation messages
  export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_MOBILE: 'Please enter a valid mobile number',
    INVALID_NUMBER: 'Please enter a valid number',
    PASSWORD_SHORT: 'Password must be at least 6 characters',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    MIN_VALUE: (min) => `Value must be at least ${min}`,
    MAX_VALUE: (max) => `Value must be at most ${max}`,
    RANGE_VALUE: (min, max) => `Value must be between ${min} and ${max}`
  };
  
  // Local storage keys
  export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user'
  };
  
  // Pagination defaults
  export const PAGINATION = {
    DEFAULT_PAGE: 0,
    DEFAULT_ROWS_PER_PAGE: 10,
    ROWS_PER_PAGE_OPTIONS: [10, 25, 50, 100]
  };
  
  // Alert durations (in milliseconds)
  export const ALERT_DURATION = 6000; // 6 seconds