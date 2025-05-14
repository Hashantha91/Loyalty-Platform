import React, { useState, useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import { KeyOutlined } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';

const ChangePasswordPage = () => {
  const { changePassword } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const { currentPassword, newPassword, confirmPassword } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'All fields are required'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'New passwords do not match'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Password must be at least 6 characters'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await changePassword(currentPassword, newPassword);
      
      // Reset form after successful password change
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Change password error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          my: 4,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          flexDirection="column"
          mb={4}
        >
          <KeyOutlined color="primary" fontSize="large" sx={{ mb: 1 }} />
          <Typography component="h1" variant="h5">
            Change Password
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="currentPassword"
            label="Current Password"
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={handleChange}
            disabled={loading}
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 4, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Update Password'
            )}
          </Button>
          
          <Typography variant="body2" color="text.secondary" align="center">
            Password must be at least 6 characters long
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChangePasswordPage;