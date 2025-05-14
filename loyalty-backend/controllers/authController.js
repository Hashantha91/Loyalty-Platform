const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const AuthController = {
  // Login user without password hashing
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log('Login attempt:', { username, password });
      
      // Check if user exists
      const user = await UserModel.getByUsername(username);
      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('Found user:', { id: user.user_id, username: user.username });
      
      // Simple password check without hashing
      if (password !== user.password) {
        console.log('Password mismatch');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('Login successful');
      
      // Create JWT payload
      const payload = {
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role
        }
      };
      
      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '12h' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.user_id,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              role: user.role,
              department: user.department
            }
          });
        }
      );
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Register new user (admin only) without password hashing
  register: async (req, res) => {
    try {
      const { username, password, first_name, last_name, email, department, role } = req.body;
      
      // Check if username already exists
      const usernameExists = await UserModel.getByUsername(username);
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Check if email already exists
      const emailExists = await UserModel.getByEmail(email);
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Create user without hashing password
      const userId = await UserModel.create({
        username,
        password, // Store plain text password
        first_name,
        last_name,
        email,
        department,
        role
      });
      
      res.status(201).json({
        message: 'User created successfully',
        user_id: userId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await UserModel.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        department: user.department
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Change password without hashing
  changePassword: async (req, res) => {
    try {
      const { current_password, new_password } = req.body;
      
      // Get user
      const user = await UserModel.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check current password without hashing
      if (current_password !== user.password) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password without hashing
      const updated = await UserModel.updatePassword(req.user.id, new_password);
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update password' });
      }
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAll();
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get user by ID (admin only)
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await UserModel.getById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userData } = user;
      
      res.json(userData);
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Update user (admin only)
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { username, password, first_name, last_name, email, department, role } = req.body;
      
      // Check if user exists
      const user = await UserModel.getById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if username is being changed
      if (username !== user.username) {
        return res.status(400).json({ message: 'Username cannot be changed' });
      }
      
      // Check if email already exists with another user
      if (email !== user.email) {
        const emailExists = await UserModel.getByEmail(email);
        if (emailExists && emailExists.user_id !== parseInt(userId)) {
          return res.status(400).json({ message: 'Email already in use by another user' });
        }
      }
      
      // Update user data
      const updateData = {
        first_name,
        last_name,
        email,
        department,
        role
      };
      
      const updated = await UserModel.update(userId, updateData);
      
      // Update password if provided (without hashing)
      if (password) {
        await UserModel.updatePassword(userId, password);
      }
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update user' });
      }
      
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Delete user (admin only)
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent deleting own account
      if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      // Prevent deleting primary admin (user_id: 1)
      if (parseInt(userId) === 1) {
        return res.status(400).json({ message: 'Cannot delete primary admin account' });
      }
      
      // Check if user exists
      const user = await UserModel.getById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const deleted = await UserModel.delete(userId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete user' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = AuthController;