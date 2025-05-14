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
import SegmentForm from '../../components/segments/SegmentForm';

const AddSegmentPage = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/segments');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Segment created successfully'
    });
    
    // Navigate to segments list
    navigate('/segments');
  };
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back to Segments
        </Button>
        <Typography variant="h5" sx={{ ml: 2 }}>
          Create Customer Segment
        </Typography>
      </Box>
      
      <SegmentForm 
        onSuccess={handleSuccess}
        onCancel={handleGoBack}
      />
    </Container>
  );
};

export default AddSegmentPage;