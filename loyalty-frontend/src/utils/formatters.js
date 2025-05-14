/**
 * Utility functions for formatting data in the frontend
 */
import { format, parseISO } from 'date-fns';

/**
 * Formats a date as a string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return 'N/A';
  
  try {
    // If date is a string, parse it first
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date with time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM d, yyyy h:mm a');
};

/**
 * Formats a currency amount
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2, currency = '$') => {
  if (amount === undefined || amount === null) return 'N/A';
  
  return `${currency}${parseFloat(amount).toFixed(decimals)}`;
};

/**
 * Formats a number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null) return 'N/A';
  
  return parseFloat(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formats a percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === undefined || value === null) return 'N/A';
  
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Formats a phone number
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  
  // Simple formatting - can be expanded based on country requirements
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  return phoneNumber;
};

/**
 * Truncates text to a specific length and adds ellipsis if needed
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formats a customer's full name
 * @param {Object} customer - Customer object with first_name and last_name
 * @returns {string} Formatted name
 */
export const formatCustomerName = (customer) => {
  if (!customer) return 'N/A';
  
  return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A';
};

/**
 * Formats loyalty points with a + or - prefix based on status
 * @param {number} points - Number of points
 * @param {string} status - Status (earned, redeemed, etc.)
 * @returns {string} Formatted points string
 */
export const formatLoyaltyPoints = (points, status) => {
  if (points === undefined || points === null) return 'N/A';
  
  if (status === 'earned') {
    return `+${points}`;
  } else if (status === 'redeemed' || status === 'expired') {
    return `-${points}`;
  }
  
  return `${points}`;
};