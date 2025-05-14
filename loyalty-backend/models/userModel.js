const { pool } = require('../config/db');

const UserModel = {
  // Create a new user without password hashing
  create: async (user) => {
    const { username, password, first_name, last_name, email, department, role } = user;
    
    try {
      // Store plain text password directly
      const [result] = await pool.query(
        'INSERT INTO users (username, password, first_name, last_name, email, department, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, password, first_name, last_name, email, department, role]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all users
  getAll: async () => {
    try {
      const [rows] = await pool.query('SELECT user_id, username, first_name, last_name, email, department, role, created_at FROM users');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user by ID
  getById: async (userId) => {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get user by username
  getByUsername: async (username) => {
    try {
      console.log('Looking for user:', username);
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      console.log('Query result:', rows);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get user by email
  getByEmail: async (email) => {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Update user
  update: async (userId, updateData) => {
    try {
      const { first_name, last_name, email, department, role } = updateData;
      
      const [result] = await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, department = ?, role = ? WHERE user_id = ?',
        [first_name, last_name, email, department, role, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Update user password without hashing
  updatePassword: async (userId, newPassword) => {
    try {
      // Store plain text password directly
      const [result] = await pool.query(
        'UPDATE users SET password = ? WHERE user_id = ?',
        [newPassword, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete user
  delete: async (userId) => {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = UserModel;