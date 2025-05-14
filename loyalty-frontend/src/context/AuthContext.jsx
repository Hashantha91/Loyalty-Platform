import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { AlertContext } from './AlertContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setAlert } = useContext(AlertContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Validate token and get user info
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Set user and auth state
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response.user;
    } catch (error) {
      setAlert({
        show: true,
        severity: 'error',
        message: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      setAlert({
        show: true,
        severity: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      setAlert({
        show: true,
        severity: 'error',
        message: error.response?.data?.message || 'Failed to change password'
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout, 
      changePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};