import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Save,
  Refresh,
  MonetizationOn,
  EmojiEvents
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import loyaltyService from '../../services/loyaltyService';
import Loader from '../common/Loader';

const PointsStructure = () => {
  const { setAlert } = useContext(AlertContext);
  
  const [currentStructure, setCurrentStructure] = useState(null);
  const [formData, setFormData] = useState({
    spend_amount: '',
    points_awarded: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    fetchPointsStructure();
  }, []);
  
  const fetchPointsStructure = async () => {
    try {
      setLoading(true);
      const data = await loyaltyService.getPointsStructure();
      
      // Ensure numeric values are properly converted
      const processedData = {
        ...data,
        spend_amount: parseFloat(data.spend_amount) || 0,
        points_awarded: parseInt(data.points_awarded) || 0
      };
      
      setCurrentStructure(processedData);
      
      // Pre-fill form with current values
      setFormData({
        spend_amount: processedData.spend_amount.toString(),
        points_awarded: processedData.points_awarded.toString()
      });
    } catch (error) {
      console.error('Error fetching points structure:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch points structure'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.spend_amount) {
      newErrors.spend_amount = 'This field is required';
    } else if (parseFloat(formData.spend_amount) <= 0) {
      newErrors.spend_amount = 'Amount must be greater than zero';
    }
    
    if (!formData.points_awarded) {
      newErrors.points_awarded = 'This field is required';
    } else if (parseInt(formData.points_awarded) <= 0) {
      newErrors.points_awarded = 'Points must be greater than zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Please fix the errors in the form'
      });
      return;
    }
    
    setSaving(true);
    
    try {
      await loyaltyService.updatePointsStructure({
        spend_amount: parseFloat(formData.spend_amount),
        points_awarded: parseInt(formData.points_awarded)
      });
      
      // Refresh data
      await fetchPointsStructure();
      
      setAlert({
        show: true,
        severity: 'success',
        message: 'Points structure updated successfully'
      });
    } catch (error) {
      console.error('Error updating points structure:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to update points structure'
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <Loader message="Loading points structure..." />;
  }
  
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" component="h2">
          Points Structure
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchPointsStructure}
          disabled={loading || saving}
        >
          Refresh
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MonetizationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Current Points Structure
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {currentStructure ? (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 3,
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'background.neutral',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentStructure.points_awarded} {currentStructure.points_awarded === 1 ? 'Point' : 'Points'}
                    </Typography>
                    <Typography variant="body1">
                      for every ${Number(currentStructure.spend_amount).toFixed(2)} spent
                    </Typography>
                  </Box>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Last updated: {currentStructure.updated_at ? new Date(currentStructure.updated_at).toLocaleString() : 'Unknown'}
                  </Alert>
                  
                  {/* Example calculation */}
                  <Typography variant="subtitle2" gutterBottom>
                    Example:
                  </Typography>
                  <Typography variant="body2">
                    • A purchase of ${(currentStructure.spend_amount * 2).toFixed(2)} would earn {currentStructure.points_awarded * 2} points
                  </Typography>
                  <Typography variant="body2">
                    • A purchase of ${(currentStructure.spend_amount * 5).toFixed(2)} would earn {currentStructure.points_awarded * 5} points
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No points structure found. Please set up the structure.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EmojiEvents color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Update Points Structure
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="spend_amount"
                    label="Spend Amount"
                    type="number"
                    inputProps={{ min: 0.01, step: 0.01 }}
                    value={formData.spend_amount}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={Boolean(errors.spend_amount)}
                    helperText={errors.spend_amount || 'Amount customers need to spend to earn points'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="points_awarded"
                    label="Points Awarded"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={formData.points_awarded}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={Boolean(errors.points_awarded)}
                    helperText={errors.points_awarded || 'Number of points earned for the specified amount'}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>Warning:</strong> Updating the points structure will affect all future transactions. 
                    This change will not affect points already earned by customers.
                  </Typography>
                </Alert>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  disabled={saving}
                >
                  Update Points Structure
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default PointsStructure;