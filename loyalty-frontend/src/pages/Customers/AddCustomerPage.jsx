import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import CustomerForm from '../../components/customers/CustomerForm';

const AddCustomerPage = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/customers');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Customer registered successfully'
    });
    
    // Navigate to customers list or to the new customer details
    navigate('/customers');
  };
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back to Customers
        </Button>
        <Typography variant="h5" sx={{ ml: 2 }}>
          Add New Customer
        </Typography>
      </Box>
      
      <CustomerForm 
        onSuccess={handleSuccess}
        onCancel={handleGoBack}
      />
    </Container>
  );
};

export default AddCustomerPage;