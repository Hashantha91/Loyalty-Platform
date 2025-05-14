import api from '../utils/api';

const customerService = {
  // Get all customers
  getAllCustomers: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  
  // Get customer by ID
  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  // Get customer by mobile
  getCustomerByMobile: async (mobile) => {
    const response = await api.get(`/customers/mobile/${mobile}`);
    return response.data;
  },
  
  // Register new customer
  registerCustomer: async (customerData) => {
    const response = await api.post('/customers/register', customerData);
    return response.data;
  },
  
  // Update customer
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  
  // Delete customer
  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
  
  // Get customer loyalty history
  getCustomerLoyaltyHistory: async (customerId) => {
    const response = await api.get(`/loyalty/history/${customerId}`);
    return response.data;
  },
  
  // Get customer transactions
  getCustomerTransactions: async (customerId) => {
    const response = await api.get(`/transactions/customer/${customerId}`);
    return response.data;
  }
};

export default customerService;