const TransactionModel = require('../models/transactionModel');
const CustomerModel = require('../models/customerModel');

const TransactionController = {
  // Record a new transaction
  createTransaction: async (req, res) => {
    try {
      const { customer_id, total_amount, products, points_redeemed } = req.body;
      
      // Validate input
      if (!customer_id || !total_amount || !products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Invalid transaction data' });
      }
      
      // Check if customer exists
      const customer = await CustomerModel.getById(customer_id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Validate points redemption
      if (points_redeemed && points_redeemed > 0) {
        if (points_redeemed > customer.available_points) {
          return res.status(400).json({ 
            message: 'Insufficient points for redemption',
            available_points: customer.available_points 
          });
        }
      }
      
      // Create transaction
      const result = await TransactionModel.create({
        customer_id,
        total_amount,
        products,
        points_redeemed: points_redeemed || 0
      });
      
      res.status(201).json({
        message: 'Transaction recorded successfully',
        transaction: result
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get all transactions
  getAllTransactions: async (req, res) => {
    try {
      const transactions = await TransactionModel.getAll();
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get transaction by invoice ID
  getTransactionByInvoiceId: async (req, res) => {
    try {
      const invoiceId = req.params.invoiceId;
      console.log('Fetching transaction for invoice ID:', invoiceId);
      
      const transaction = await TransactionModel.getByInvoiceId(invoiceId);
      
      if (!transaction) {
        console.log('Transaction not found:', invoiceId);
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      console.log('Transaction found:', transaction);
      res.json(transaction);
    } catch (error) {
      console.error('Error getting transaction:', error);
      res.status(500).json({ 
        message: 'Failed to fetch transaction details', 
        error: error.message,
        details: error.stack 
      });
    }
  },
  
  // Get customer transactions
  getCustomerTransactions: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      
      // Check if customer exists
      const customer = await CustomerModel.getById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      const transactions = await TransactionModel.getByCustomerId(customerId);
      res.json(transactions);
    } catch (error) {
      console.error('Error getting customer transactions:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Get transaction details
  getTransactionDetails: async (req, res) => {
    try {
      const invoiceId = req.params.invoiceId;
      const details = await TransactionModel.getTransactionDetails(invoiceId);
      
      if (!details) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json(details);
    } catch (error) {
      console.error('Error getting transaction details:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = TransactionController;