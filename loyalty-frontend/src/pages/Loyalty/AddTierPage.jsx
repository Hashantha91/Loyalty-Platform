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
import TierForm from '../../components/loyalty/TierForm';

const AddTierPage = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/loyalty/tiers');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Tier created successfully'
    });
    
    // Navigate to tiers list
    navigate('/loyalty/tiers');
  };
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back to Tiers
        </Button>
        <Typography variant="h5" sx={{ ml: 2 }}>
          Add New Loyalty Tier
        </Typography>
      </Box>
      
      <TierForm 
        onSuccess={handleSuccess}
        onCancel={handleGoBack}
      />
    </Container>
  );
};

export default AddTierPage;