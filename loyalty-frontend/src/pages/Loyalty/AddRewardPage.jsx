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
import RewardForm from '../../components/loyalty/RewardForm';

const AddRewardPage = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/loyalty/rewards');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Reward created successfully'
    });
    
    // Navigate to rewards list
    navigate('/loyalty/rewards');
  };
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back to Rewards
        </Button>
        <Typography variant="h5" sx={{ ml: 2 }}>
          Add New Reward
        </Typography>
      </Box>
      
      <RewardForm 
        onSuccess={handleSuccess}
        onCancel={handleGoBack}
      />
    </Container>
  );
};

export default AddRewardPage;