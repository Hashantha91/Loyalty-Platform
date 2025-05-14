import axios from 'axios';
import { STORAGE_KEYS } from './constants';

// Create an axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add authentication token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Handles API errors consistently
 * @param {Error} error - The error object
 * @param {Function} setAlert - Function to set alert message
 * @param {string} defaultMessage - Default error message
 */
export const handleApiError = (error, setAlert, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  const errorMessage = error.response?.data?.message || defaultMessage;
  
  if (setAlert) {
    setAlert({
      show: true,
      severity: 'error',
      message: errorMessage
    });
  }
  
  return errorMessage;
};

/**
 * Converts an object to query parameters
 * @param {Object} params - Parameters to convert
 * @returns {string} Query string
 */
export const buildQueryParams = (params) => {
  if (!params || Object.keys(params).length === 0) return '';
  
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryParams ? `?${queryParams}` : '';
};

/**
 * Downloads a file from a blob
 * @param {Blob} blob - Blob data
 * @param {string} filename - Filename
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Converts data to CSV and downloads it
 * @param {Array} data - Array of objects to convert to CSV
 * @param {Array} headers - Array of column headers
 * @param {Array} fields - Array of field names corresponding to headers
 * @param {string} filename - Filename for the downloaded file
 */
export const downloadCSV = (data, headers, fields, filename) => {
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  data.forEach(item => {
    const values = fields.map(field => {
      const value = item[field] !== undefined && item[field] !== null ? item[field] : '';
      // Escape commas and quotes in values
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  });
  
  // Create blob and download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  downloadFile(blob, filename);
};

export default api;