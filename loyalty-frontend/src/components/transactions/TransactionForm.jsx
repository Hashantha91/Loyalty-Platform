import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  Save,
  Cancel,
  Add,
  Delete,
  Search,
  Receipt
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import transactionService from '../../services/transactionService';
import customerService from '../../services/customerService';
import Loader from '../common/Loader';

const TransactionForm = ({ onSuccess, onCancel }) => {
  const { setAlert } = useContext(AlertContext);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    total_amount: 0,
    points_redeemed: 0,
    products: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [productInput, setProductInput] = useState({
    product_id: '',
    product_name: '',
    quantity: 1,
    discount: 0,
    amount: 0
  });
  const [redeemPoints, setRedeemPoints] = useState(false);
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch customers'
      });
    } finally {
      setLoadingCustomers(false);
    }
  };
  
  const handleCustomerChange = (event, newValue) => {
    setSelectedCustomer(newValue);
    
    if (newValue) {
      setFormData({
        ...formData,
        customer_id: newValue.customer_id
      });
      
      // Clear customer_id error if it exists
      if (errors.customer_id) {
        setErrors({
          ...errors,
          customer_id: null
        });
      }
    } else {
      setFormData({
        ...formData,
        customer_id: ''
      });
    }
  };
  
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductInput({
      ...productInput,
      [name]: value
    });
    
    // Recalculate amount when quantity or price changes
    if (name === 'quantity' || name === 'unit_price') {
      const quantity = name === 'quantity' ? parseInt(value, 10) || 0 : productInput.quantity;
      const unitPrice = name === 'unit_price' ? parseFloat(value) || 0 : productInput.unit_price;
      const discount = productInput.discount / 100; // Convert discount percentage to a decimal
      
      const amount = quantity * unitPrice * (1 - discount);
      
      setProductInput({
        ...productInput,
        [name]: value,
        amount: parseFloat(amount.toFixed(2))
      });
    }
    
    if (name === 'discount') {
      const discount = parseFloat(value) / 100 || 0; // Convert discount percentage to a decimal
      const quantity = productInput.quantity;
      const unitPrice = productInput.unit_price || 0;
      
      const amount = quantity * unitPrice * (1 - discount);
      
      setProductInput({
        ...productInput,
        discount: value,
        amount: parseFloat(amount.toFixed(2))
      });
    }
  };
  
  const handleAddProduct = () => {
    // Validate product input
    if (!productInput.product_name || !productInput.quantity || !productInput.amount) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Please fill in all required product fields'
      });
      return;
    }
    
    const newProduct = {
      ...productInput,
      id: Date.now() // Temporary ID for frontend use
    };
    
    const updatedProducts = [...formData.products, newProduct];
    
    // Calculate new total amount
    const newTotalAmount = updatedProducts.reduce((sum, product) => sum + product.amount, 0);
    
    setFormData({
      ...formData,
      products: updatedProducts,
      total_amount: parseFloat(newTotalAmount.toFixed(2))
    });
    
    // Reset product input
    setProductInput({
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: '',
      discount: 0,
      amount: 0
    });
  };
  
  const handleRemoveProduct = (productId) => {
    const updatedProducts = formData.products.filter(product => product.id !== productId);
    
    // Recalculate total amount
    const newTotalAmount = updatedProducts.reduce((sum, product) => sum + product.amount, 0);
    
    setFormData({
      ...formData,
      products: updatedProducts,
      total_amount: parseFloat(newTotalAmount.toFixed(2))
    });
  };
  
  const handleRedeemPointsToggle = () => {
    setRedeemPoints(!redeemPoints);
    
    if (!redeemPoints) {
      setFormData({
        ...formData,
        points_redeemed: 0
      });
    }
  };
  
  const handlePointsRedeemedChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    
    setFormData({
      ...formData,
      points_redeemed: value
    });
    
    // Clear points_redeemed error if it exists
    if (errors.points_redeemed) {
      setErrors({
        ...errors,
        points_redeemed: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer';
    }
    
    if (formData.products.length === 0) {
      newErrors.products = 'Please add at least one product';
    }
    
    // Validate points redemption
    if (redeemPoints) {
      if (!formData.points_redeemed || formData.points_redeemed <= 0) {
        newErrors.points_redeemed = 'Points to redeem must be a positive number';
      } else if (selectedCustomer && formData.points_redeemed > selectedCustomer.available_points) {
        newErrors.points_redeemed = 'Cannot redeem more points than available';
      }
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
      // Prepare data for submission
      const transactionData = {
        customer_id: formData.customer_id,
        total_amount: formData.total_amount,
        points_redeemed: redeemPoints ? formData.points_redeemed : 0,
        products: formData.products.map(product => ({
          product_id: product.product_id || 0, // If no product_id, use 0 as placeholder
          product_name: product.product_name,
          quantity: product.quantity,
          discount: product.discount,
          amount: product.amount
        }))
      };
      
      const result = await transactionService.createTransaction(transactionData);
      
      setAlert({
        show: true,
        severity: 'success',
        message: 'Transaction recorded successfully'
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: error.response?.data?.message || 'Failed to save transaction'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Receipt color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">
          Record New Transaction
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              id="customer-select"
              options={customers}
              loading={loadingCustomers}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
              isOptionEqualToValue={(option, value) => option.customer_id === value.customer_id}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              inputValue={customerSearchInput}
              onInputChange={(event, newInputValue) => {
                setCustomerSearchInput(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Customer"
                  required
                  error={Boolean(errors.customer_id)}
                  helperText={errors.customer_id}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.first_name} {option.last_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {option.email} • {option.mobile}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </Grid>
          
          {selectedCustomer && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1">
                      {selectedCustomer.customer_id}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Loyalty Tier
                    </Typography>
                    <Chip 
                      label={selectedCustomer.tier} 
                      color={
                        selectedCustomer.tier === 'Purple' ? 'primary' :
                        selectedCustomer.tier === 'Gold' ? 'secondary' : 'default'
                      }
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Available Points
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {selectedCustomer.available_points} points
                    </Typography>
                  </Grid>
                </Grid>
                
                {selectedCustomer.available_points > 0 && (
                  <Box mt={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={redeemPoints}
                          onChange={handleRedeemPointsToggle}
                          color="primary"
                        />
                      }
                      label="Redeem points in this transaction"
                    />
                    
                    {redeemPoints && (
                      <Box mt={1}>
                        <TextField
                          label="Points to Redeem"
                          type="number"
                          inputProps={{ min: 0, max: selectedCustomer.available_points }}
                          value={formData.points_redeemed}
                          onChange={handlePointsRedeemedChange}
                          error={Boolean(errors.points_redeemed)}
                          helperText={errors.points_redeemed || `Maximum ${selectedCustomer.available_points} points available`}
                          fullWidth
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
        
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Products
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              name="product_name"
              label="Product Name"
              value={productInput.product_name}
              onChange={handleProductInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              inputProps={{ min: 1 }}
              value={productInput.quantity}
              onChange={handleProductInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              name="unit_price"
              label="Unit Price"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={productInput.unit_price}
              onChange={handleProductInputChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              name="discount"
              label="Discount %"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={productInput.discount}
              onChange={handleProductInputChange}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              name="amount"
              label="Total"
              type="number"
              value={productInput.amount}
              onChange={handleProductInputChange}
              fullWidth
              disabled
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleAddProduct}
              fullWidth
            >
              <Add />
            </Button>
          </Grid>
        </Grid>
        
        {errors.products && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {errors.products}
          </Typography>
        )}
        
        {formData.products.length > 0 ? (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                    <TableCell align="right">${parseFloat(product.unit_price).toFixed(2)}</TableCell>
                    <TableCell align="right">{product.discount}%</TableCell>
                    <TableCell align="right">${product.amount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="subtitle1">Total Amount:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1">${formData.total_amount.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 2, mb: 3, textAlign: 'center', bgcolor: 'background.neutral' }}>
            <Typography variant="body1" color="textSecondary">
              No products added yet. Add products to this transaction using the form above.
            </Typography>
          </Paper>
        )}
        
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
            Record Transaction
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TransactionForm;