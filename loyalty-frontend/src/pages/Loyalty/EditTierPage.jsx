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
import TierForm from '../../components/loyalty/TierForm';
import Loader from '../../components/common/Loader';

const EditTierPage = () => {
  const { id } = useParams();
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTier = async () => {
      try {
        setLoading(true);
        const data = await loyaltyService.getTierById(id);
        setTier(data);
      } catch (error) {
        console.error('Error fetching tier:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to fetch tier details'
        });
        // Navigate back to tiers list on error
        navigate('/loyalty/tiers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTier();
  }, [id, navigate, setAlert]);
  
  const handleGoBack = () => {
    navigate('/loyalty/tiers');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Tier updated successfully'
    });
    
    // Navigate to tiers list
    navigate('/loyalty/tiers');
  };
  
  if (loading) {
    return <Loader message="Loading tier details..." />;
  }
  
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
          Edit Loyalty Tier
        </Typography>
      </Box>
      
      {tier && (
        <TierForm 
          tier={tier}
          onSuccess={handleSuccess}
          onCancel={handleGoBack}
        />
      )}
    </Container>
  );
};

export default EditTierPage;