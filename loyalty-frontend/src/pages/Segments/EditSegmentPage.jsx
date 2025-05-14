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
import segmentService from '../../services/segmentService';
import SegmentForm from '../../components/segments/SegmentForm';
import Loader from '../../components/common/Loader';

const EditSegmentPage = () => {
  const { id } = useParams();
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [segment, setSegment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSegment = async () => {
      try {
        setLoading(true);
        const data = await segmentService.getSegmentById(id);
        setSegment(data);
      } catch (error) {
        console.error('Error fetching segment:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to fetch segment details'
        });
        // Navigate back to segments list on error
        navigate('/segments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSegment();
  }, [id, navigate, setAlert]);
  
  const handleGoBack = () => {
    navigate('/segments');
  };
  
  const handleSuccess = (result) => {
    setAlert({
      show: true,
      severity: 'success',
      message: 'Segment updated successfully'
    });
    
    // Navigate to segments list
    navigate('/segments');
  };
  
  if (loading) {
    return <Loader message="Loading segment details..." />;
  }
  
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
          Edit Segment
        </Typography>
      </Box>
      
      {segment && (
        <SegmentForm 
          segment={segment}
          onSuccess={handleSuccess}
          onCancel={handleGoBack}
        />
      )}
    </Container>
  );
};

export default EditSegmentPage;