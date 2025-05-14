import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  InputAdornment,
  Slider,
  Chip
} from '@mui/material';
import {
  Save,
  Cancel
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import loyaltyService from '../../services/loyaltyService';

const TierForm = ({ tier, onSuccess, onCancel }) => {
  const { setAlert } = useContext(AlertContext);
  const isEditMode = Boolean(tier);
  
  const [formData, setFormData] = useState({
    tier_name: '',
    threshold: 0,
    discount: 0,
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Pre-fill form if in edit mode
    if (isEditMode && tier) {
      setFormData({
        tier_name: tier.tier_name || '',
        threshold: tier.threshold || 0,
        discount: tier.discount || 0,
        description: tier.description || ''
      });
    }
  }, [tier, isEditMode]);
  
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
  
  const handleSliderChange = (name) => (e, newValue) => {
    setFormData({
      ...formData,
      [name]: newValue
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
    if (!formData.tier_name) {
      newErrors.tier_name = 'Tier name is required';
    }
    
    // Validate threshold is a non-negative number
    if (formData.threshold < 0) {
      newErrors.threshold = 'Threshold must be a non-negative number';
    }
    
    // Validate discount is between 0 and 100
    if (formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = 'Discount must be between 0 and 100';
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
    
    setLoading(true);
    
    try {
      let result;
      
      if (isEditMode) {
        // Update existing tier
        result = await loyaltyService.updateTier(tier.tier_id, formData);
        
        setAlert({
          show: true,
          severity: 'success',
          message: 'Tier updated successfully'
        });
      } else {
        // Create new tier
        result = await loyaltyService.createTier(formData);
        
        setAlert({
          show: true,
          severity: 'success',
          message: 'Tier created successfully'
        });
        
        // Reset form
        setFormData({
          tier_name: '',
          threshold: 0,
          discount: 0,
          description: ''
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error saving tier:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: error.response?.data?.message || 'Failed to save tier'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getTierColor = (tierName) => {
    if (tierName === 'Purple') return 'primary';
    if (tierName === 'Gold') return 'secondary';
    if (tierName === 'Platinum') return 'default';
    return 'default';
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Edit Tier' : 'Add New Tier'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="tier_name"
              label="Tier Name"
              value={formData.tier_name}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.tier_name)}
              helperText={errors.tier_name}
              InputProps={{
                endAdornment: formData.tier_name && (
                  <InputAdornment position="end">
                    <Chip 
                      label={formData.tier_name} 
                      color={getTierColor(formData.tier_name)}
                      size="small"
                    />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="threshold"
              label="Point Threshold"
              type="number"
              inputProps={{ min: 0 }}
              value={formData.threshold}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.threshold)}
              helperText={errors.threshold || 'Minimum points required to reach this tier'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography id="discount-slider" gutterBottom>
              Discount Percentage: {formData.discount}%
            </Typography>
            <Slider
              aria-labelledby="discount-slider"
              value={formData.discount}
              onChange={handleSliderChange('discount')}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={50}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              error={Boolean(errors.description)}
              helperText={errors.description}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Cancel />}
              onClick={onCancel}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={loading}
          >
            {isEditMode ? 'Update Tier' : 'Save Tier'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TierForm;