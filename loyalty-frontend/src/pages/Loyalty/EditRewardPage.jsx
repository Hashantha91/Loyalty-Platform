import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import loyaltyService from '../../services/loyaltyService';
import RewardForm from '../../components/loyalty/RewardForm';
import Loader from '../../components/common/Loader';

const EditRewardPage = () => {
  const { id } = useParams();
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReward = async () => {
      try {
        setLoading(true);
        const data = await loyaltyService.getRewardById(id);
        setReward(data);
      } catch (error) {
        console.error('Error fetching reward:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to fetch reward details'
        });
        // Navigate back to rewards list on error
        navigate('/loyalty/rewards');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReward();
  }, [id, navigate, setAlert]);
  
  const handleGoBack = () => {
    navigate('/loyalty/rewards');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Reward updated successfully'
    });
    
    // Navigate to rewards list
    navigate('/loyalty/rewards');
  };
  
  if (loading) {
    return <Loader message="Loading reward details..." />;
  }
  
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
          Edit Reward
        </Typography>
      </Box>
      
      {reward && (
        <RewardForm 
          reward={reward}
          onSuccess={handleSuccess}
          onCancel={handleGoBack}
        />
      )}
    </Container>
  );
};

export default EditRewardPage;