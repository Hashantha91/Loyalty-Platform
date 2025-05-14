const { pool } = require('../config/db');

const SegmentModel = {
  // Create a new segment
  create: async (segmentData) => {
    const { segment_name, criteria, created_by } = segmentData;
    
    try {
      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Insert segment
        const [segmentResult] = await connection.query(
          'INSERT INTO customer_segments (segment_name, criteria, created_by) VALUES (?, ?, ?)',
          [segment_name, JSON.stringify(criteria), created_by]
        );
        
        const segment_id = segmentResult.insertId;
        
        // Build query based on criteria
        let whereClause = '';
        const queryParams = [];
        
        // Process criteria
        if (criteria.tier) {
          whereClause += 'tier = ? AND ';
          queryParams.push(criteria.tier);
        }
        
        if (criteria.min_points) {
          whereClause += 'available_points >= ? AND ';
          queryParams.push(criteria.min_points);
        }
        
        if (criteria.max_points) {
          whereClause += 'available_points <= ? AND ';
          queryParams.push(criteria.max_points);
        }
        
        if (criteria.join_date_from) {
          whereClause += 'join_date >= ? AND ';
          queryParams.push(criteria.join_date_from);
        }
        
        if (criteria.join_date_to) {
          whereClause += 'join_date <= ? AND ';
          queryParams.push(criteria.join_date_to);
        }
        
        // Remove the last ' AND '
        if (whereClause.length > 0) {
          whereClause = whereClause.slice(0, -5);
        } else {
          whereClause = '1=1'; // Default to select all if no criteria
        }
        
        // Get customers matching criteria
        const [customers] = await connection.query(
          `SELECT customer_id FROM customers WHERE ${whereClause}`,
          queryParams
        );
        
        // Add customers to segment
        for (const customer of customers) {
          await connection.query(
            'INSERT INTO segment_customers (segment_id, customer_id) VALUES (?, ?)',
            [segment_id, customer.customer_id]
          );
        }
        
        await connection.commit();
        
        return {
          segment_id,
          customer_count: customers.length
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Get all segments
  getAll: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT s.*, u.first_name, u.last_name, COUNT(sc.customer_id) as customer_count
        FROM customer_segments s
        LEFT JOIN segment_customers sc ON s.segment_id = sc.segment_id
        LEFT JOIN users u ON s.created_by = u.user_id
        GROUP BY s.segment_id
        ORDER BY s.created_at DESC
      `);
      
      return rows.map(row => ({
        ...row,
        criteria: JSON.parse(row.criteria)
      }));
    } catch (error) {
      throw error;
    }
  },
  
  // Get segment by ID
  getById: async (segmentId) => {
    try {
      const [segmentRows] = await pool.query(`
        SELECT s.*, u.first_name, u.last_name, COUNT(sc.customer_id) as customer_count
        FROM customer_segments s
        LEFT JOIN segment_customers sc ON s.segment_id = sc.segment_id
        LEFT JOIN users u ON s.created_by = u.user_id
        WHERE s.segment_id = ?
        GROUP BY s.segment_id
      `, [segmentId]);
      
      if (segmentRows.length === 0) {
        return null;
      }
      
      const segment = {
        ...segmentRows[0],
        criteria: JSON.parse(segmentRows[0].criteria)
      };
      
      // Get customers in this segment
      const [customerRows] = await pool.query(`
        SELECT c.* 
        FROM customers c
        JOIN segment_customers sc ON c.customer_id = sc.customer_id
        WHERE sc.segment_id = ?
      `, [segmentId]);
      
      segment.customers = customerRows;
      
      return segment;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete segment
  delete: async (segmentId) => {
    try {
      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Delete segment customers first (due to foreign key constraint)
        await connection.query('DELETE FROM segment_customers WHERE segment_id = ?', [segmentId]);
        
        // Delete segment
        const [result] = await connection.query('DELETE FROM customer_segments WHERE segment_id = ?', [segmentId]);
        
        await connection.commit();
        
        return result.affectedRows > 0;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Update segment
  update: async (segmentId, segmentData) => {
    const { segment_name, criteria } = segmentData;
    
    try {
      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Update segment
        await connection.query(
          'UPDATE customer_segments SET segment_name = ?, criteria = ? WHERE segment_id = ?',
          [segment_name, JSON.stringify(criteria), segmentId]
        );
        
        // Delete old segment customers
        await connection.query('DELETE FROM segment_customers WHERE segment_id = ?', [segmentId]);
        
        // Build query based on criteria
        let whereClause = '';
        const queryParams = [];
        
        // Process criteria
        if (criteria.tier) {
          whereClause += 'tier = ? AND ';
          queryParams.push(criteria.tier);
        }
        
        if (criteria.min_points) {
          whereClause += 'available_points >= ? AND ';
          queryParams.push(criteria.min_points);
        }
        
        if (criteria.max_points) {
          whereClause += 'available_points <= ? AND ';
          queryParams.push(criteria.max_points);
        }
        
        if (criteria.join_date_from) {
          whereClause += 'join_date >= ? AND ';
          queryParams.push(criteria.join_date_from);
        }
        
        if (criteria.join_date_to) {
          whereClause += 'join_date <= ? AND ';
          queryParams.push(criteria.join_date_to);
        }
        
        // Remove the last ' AND '
        if (whereClause.length > 0) {
          whereClause = whereClause.slice(0, -5);
        } else {
          whereClause = '1=1'; // Default to select all if no criteria
        }
        
        // Get customers matching criteria
        const [customers] = await connection.query(
          `SELECT customer_id FROM customers WHERE ${whereClause}`,
          queryParams
        );
        
        // Add customers to segment
        for (const customer of customers) {
          await connection.query(
            'INSERT INTO segment_customers (segment_id, customer_id) VALUES (?, ?)',
            [segmentId, customer.customer_id]
          );
        }
        
        await connection.commit();
        
        return customers.length;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
};

module.exports = SegmentModel;