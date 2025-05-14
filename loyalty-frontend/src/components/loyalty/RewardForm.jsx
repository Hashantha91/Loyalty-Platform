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
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Save,
  Cancel,
  CardGiftcard
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import loyaltyService from '../../services/loyaltyService';

const RewardForm = ({ reward, onSuccess, onCancel }) => {
  const { setAlert } = useContext(AlertContext);
  const isEditMode = Boolean(reward);
  
  const [formData, setFormData] = useState({
    reward_name: '',
    points_required: 100,
    discount_value: 0,
    description: '',
    active: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Pre-fill form if in edit mode
    if (isEditMode && reward) {
      setFormData({
        reward_name: reward.reward_name || '',
        points_required: reward.points_required || 100,
        discount_value: reward.discount_value || 0,
        description: reward.description || '',
        active: reward.active !== undefined ? reward.active : true
      });
    }
  }, [reward, isEditMode]);
  
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
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
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
    if (!formData.reward_name) {
      newErrors.reward_name = 'Reward name is required';
    }
    
    // Validate points required is a positive number
    if (!formData.points_required || formData.points_required <= 0) {
      newErrors.points_required = 'Points required must be a positive number';
    }
    
    // Validate discount value is between 0 and 100
    if (formData.discount_value < 0 || formData.discount_value > 100) {
      newErrors.discount_value = 'Discount must be between 0 and 100';
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
        // Update existing reward
        result = await loyaltyService.updateReward(reward.reward_id, formData);
        
        setAlert({
          show: true,
          severity: 'success',
          message: 'Reward updated successfully'
        });
      } else {
        // Create new reward
        result = await loyaltyService.createReward(formData);
        
        setAlert({
          show: true,
          severity: 'success',
          message: 'Reward created successfully'
        });
        
        // Reset form
        setFormData({
          reward_name: '',
          points_required: 100,
          discount_value: 0,
          description: '',
          active: true
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: error.response?.data?.message || 'Failed to save reward'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <CardGiftcard color="secondary" sx={{ mr: 1 }} />
        <Typography variant="h5">
          {isEditMode ? 'Edit Reward' : 'Add New Reward'}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="reward_name"
              label="Reward Name"
              value={formData.reward_name}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.reward_name)}
              helperText={errors.reward_name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="points_required"
              label="Points Required"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.points_required}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.points_required)}
              helperText={errors.points_required || 'Minimum points needed to redeem this reward'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={handleSwitchChange}
                  name="active"
                  color="primary"
                />
              }
              label={formData.active ? "Active" : "Inactive"}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography id="discount-slider" gutterBottom>
              Discount Value: {formData.discount_value}%
            </Typography>
            <Slider
              aria-labelledby="discount-slider"
              value={formData.discount_value}
              onChange={handleSliderChange('discount_value')}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={100}
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
            {isEditMode ? 'Update Reward' : 'Save Reward'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RewardForm;