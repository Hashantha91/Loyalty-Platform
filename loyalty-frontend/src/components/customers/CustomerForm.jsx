import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Save,
  Cancel,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import customerService from '../../services/customerService';
import loyaltyService from '../../services/loyaltyService';

const CustomerForm = ({ customer, onSuccess, onCancel }) => {
  const { setAlert } = useContext(AlertContext);
  const isEditMode = Boolean(customer);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    address: '',
    identification_no: '',
    tier: 'Purple',
    available_points: 0
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState([]);
  
  useEffect(() => {
    // Pre-fill form if in edit mode
    if (isEditMode && customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        mobile: customer.mobile || '',
        address: customer.address || '',
        identification_no: customer.identification_no || '',
        tier: customer.tier || 'Purple',
        available_points: customer.available_points || 0
      });
    }
    
    // Fetch loyalty tiers
    const fetchTiers = async () => {
      try {
        const tiersData = await loyaltyService.getAllTiers();
        setTiers(tiersData);
      } catch (error) {
        console.error('Error fetching tiers:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to fetch loyalty tiers'
        });
      }
    };
    
    fetchTiers();
  }, [customer, isEditMode, setAlert]);
  
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
    const requiredFields = ['first_name', 'last_name', 'email', 'mobile', 'address'];
    
    if (!isEditMode) {
      requiredFields.push('identification_no');
    }
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Validate email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate mobile format (basic check)
    if (formData.mobile && !/^[0-9+\s-]{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
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
        // Update existing customer
        result = await customerService.updateCustomer(customer.customer_id, formData);
        
        // Get updated customer data
        const updatedCustomer = await customerService.getCustomerById(customer.customer_id);
        
        onSuccess(updatedCustomer);
      } else {
        // Register new customer
        result = await customerService.registerCustomer(formData);
        
        setAlert({
          show: true,
          severity: 'success',
          message: 'Customer registered successfully'
        });
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          mobile: '',
          address: '',
          identification_no: '',
          tier: 'Purple',
          available_points: 0
        });
        
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: error.response?.data?.message || 'Failed to save customer'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Edit Customer' : 'Add New Customer'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="first_name"
              label="First Name"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.first_name)}
              helperText={errors.first_name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="last_name"
              label="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.last_name)}
              helperText={errors.last_name}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="mobile"
              label="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.mobile)}
              helperText={errors.mobile}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              error={Boolean(errors.address)}
              helperText={errors.address}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="identification_no"
              label="Identification Number"
              value={formData.identification_no}
              onChange={handleChange}
              fullWidth
              required={!isEditMode}
              disabled={isEditMode} // Prevent editing ID number after creation
              error={Boolean(errors.identification_no)}
              helperText={errors.identification_no || (isEditMode ? 'ID Number cannot be changed' : '')}
            />
          </Grid>
          
          {isEditMode && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tier"
                  label="Loyalty Tier"
                  select
                  value={formData.tier}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.tier)}
                  helperText={errors.tier}
                >
                  {tiers.map((tier) => (
                    <MenuItem key={tier.tier_id} value={tier.tier_name}>
                      {tier.tier_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="available_points"
                  label="Available Points"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.available_points}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.available_points)}
                  helperText={errors.available_points}
                />
              </Grid>
            </>
          )}
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
            {isEditMode ? 'Update Customer' : 'Save Customer'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CustomerForm;