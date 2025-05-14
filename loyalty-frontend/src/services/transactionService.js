import api from '../utils/api';

const transactionService = {
// Get all transactions
getAllTransactions: async () => {
  const response = await api.get('/transactions');
  // Ensure numeric fields are properly converted
  return response.data.map(transaction => ({
    ...transaction,
    total_amount: parseFloat(transaction.total_amount) || 0,
    points_earned: parseInt(transaction.points_earned) || 0,
    points_redeemed: parseInt(transaction.points_redeemed) || 0
  }));
},
  
  // Get transaction by invoice ID
  getTransactionByInvoiceId: async (invoiceId) => {
    const response = await api.get(`/transactions/${invoiceId}`);
    return response.data;
  },
  
  // Get transaction details
  getTransactionDetails: async (invoiceId) => {
    const response = await api.get(`/transactions/${invoiceId}/details`);
    return response.data;
  },
  
  // Create transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
  
  // Get customer transactions
  getCustomerTransactions: async (customerId) => {
    const response = await api.get(`/transactions/customer/${customerId}`);
    return response.data;
  }
};

export default transactionService;