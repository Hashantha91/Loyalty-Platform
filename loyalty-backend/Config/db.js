const mysql = require('mysql2/promise');
require('dotenv').config();

// Creating a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'loyalty_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testing the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection
};