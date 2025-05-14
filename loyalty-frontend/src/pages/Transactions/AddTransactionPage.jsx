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
import TransactionForm from '../../components/transactions/TransactionForm';

const AddTransactionPage = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/transactions');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Transaction recorded successfully'
    });
    
    // Navigate to transaction details or back to list
    if (result && result.invoice_id) {
      navigate(`/transactions/${result.invoice_id}`);
    } else {
      navigate('/transactions');
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back to Transactions
        </Button>
        <Typography variant="h5" sx={{ ml: 2 }}>
          Record New Transaction
        </Typography>
      </Box>
      
      <TransactionForm 
        onSuccess={handleSuccess}
        onCancel={handleGoBack}
      />
    </Container>
  );
};

export default AddTransactionPage;