/**
 * Utility functions for validating form inputs
 */
import { VALIDATION_MESSAGES } from './constants';

/**
 * Validates that a value is not empty
 * @param {string} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const required = (value) => {
  return value === undefined || value === null || value === '' 
    ? VALIDATION_MESSAGES.REQUIRED 
    : null;
};

/**
 * Validates that a value is a valid email address
 * @param {string} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const isEmail = (value) => {
  if (!value) return null; // Don't validate empty values, use required() for that
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(value) ? VALIDATION_MESSAGES.INVALID_EMAIL : null;
};

/**
 * Validates that a value is a valid mobile number
 * @param {string} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const isMobile = (value) => {
  if (!value) return null;
  
  // Simple validation - at least 10 digits, allowing +, -, and spaces
  const mobileRegex = /^[0-9+\s-]{10,15}$/;
  return !mobileRegex.test(value) ? VALIDATION_MESSAGES.INVALID_MOBILE : null;
};

/**
 * Validates that a value is a number
 * @param {string|number} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const isNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  
  return isNaN(Number(value)) ? VALIDATION_MESSAGES.INVALID_NUMBER : null;
};

/**
 * Validates that a value is at least a minimum length
 * @param {number} minLength - Minimum length
 * @param {string} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const minLength = (minLength) => (value) => {
  if (!value) return null;
  
  return value.length < minLength 
    ? `Must be at least ${minLength} characters` 
    : null;
};

/**
 * Validates that a value is at most a maximum length
 * @param {number} maxLength - Maximum length
 * @param {string} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const maxLength = (maxLength) => (value) => {
  if (!value) return null;
  
  return value.length > maxLength 
    ? `Must be no more than ${maxLength} characters` 
    : null;
};

/**
 * Validates that a number is at least a minimum value
 * @param {number} min - Minimum value
 * @param {number} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const minValue = (min) => (value) => {
  if (value === undefined || value === null || value === '') return null;
  
  const num = Number(value);
  return isNaN(num) || num < min 
    ? VALIDATION_MESSAGES.MIN_VALUE(min) 
    : null;
};

/**
 * Validates that a number is at most a maximum value
 * @param {number} max - Maximum value
 * @param {number} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const maxValue = (max) => (value) => {
  if (value === undefined || value === null || value === '') return null;
  
  const num = Number(value);
  return isNaN(num) || num > max 
    ? VALIDATION_MESSAGES.MAX_VALUE(max) 
    : null;
};

/**
 * Validates that a number is between a minimum and maximum value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} value - Value to validate
 * @returns {string|null} Error message or null if valid
 */
export const rangeValue = (min, max) => (value) => {
  if (value === undefined || value === null || value === '') return null;
  
  const num = Number(value);
  return isNaN(num) || num < min || num > max 
    ? VALIDATION_MESSAGES.RANGE_VALUE(min, max) 
    : null;
};

/**
 * Validates that two values match
 * @param {any} compareValue - Value to compare against
 * @param {any} value - Value to validate
 * @param {string} message - Error message
 * @returns {string|null} Error message or null if valid
 */
export const matches = (compareValue, message) => (value) => {
  return value !== compareValue ? message : null;
};

/**
 * Validates a form by applying multiple validation functions to each field
 * @param {Object} data - Form data
 * @param {Object} validations - Validation functions by field
 * @returns {Object} Object with errors by field
 */
export const validateForm = (data, validations) => {
  const errors = {};
  
  Object.keys(validations).forEach(field => {
    const fieldValidators = validations[field];
    const value = data[field];
    
    // Apply each validator for this field
    for (const validator of fieldValidators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break; // Stop after first error
      }
    }
  });
  
  return errors;
};