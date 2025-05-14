import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack,
  Receipt,
  Person,
  ShoppingBag,
  LocalAtm,
  CalendarToday,
  Add,
  Remove
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AlertContext } from '../../context/AlertContext';
import transactionService from '../../services/transactionService';
import customerService from '../../services/customerService';
import Loader from '../common/Loader';

const TransactionDetails = () => {
  const { id } = useParams();
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);
  
  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactionByInvoiceId(id);
      setTransaction(data);
      
      if (data.products) {
        setProducts(data.products);
      }
      
      // Fetch customer details
      if (data.customer_id) {
        const customerData = await customerService.getCustomerById(data.customer_id);
        setCustomer(customerData);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch transaction details'
      });
      // Navigate back to transactions list on error
      navigate('/transactions');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigate('/transactions');
  };
  
  const handleViewCustomer = () => {
    if (customer) {
      navigate(`/customers/${customer.customer_id}`);
    }
  };
  
  if (loading) {
    return <Loader message="Loading transaction details..." />;
  }
  
  if (!transaction) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" color="error" gutterBottom>
          Transaction not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back to Transactions
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back
        </Button>
        <Typography variant="h5" sx={{ ml: 2, flexGrow: 1 }}>
          Transaction Details
        </Typography>
        {customer && (
          <Button 
            variant="outlined" 
            startIcon={<Person />} 
            onClick={handleViewCustomer}
          >
            View Customer
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Receipt fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Invoice ID"
                  secondary={transaction.invoice_id}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CalendarToday fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Date & Time"
                  secondary={format(new Date(transaction.invoice_date), 'MMMM d, yyyy h:mm a')}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LocalAtm fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Amount"
                  secondary={`$${parseFloat(transaction.total_amount).toFixed(2)}`}
                />
              </ListItem>
              
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Add fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Points Earned"
                  secondary={transaction.points_earned}
                />
              </ListItem>
              
              {transaction.points_redeemed > 0 && (
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Remove fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Points Redeemed"
                    secondary={transaction.points_redeemed}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
          
          {customer && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Customer ID
                  </Typography>
                  <Typography variant="body1">
                    {customer.customer_id}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {customer.first_name} {customer.last_name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {customer.email}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Mobile
                  </Typography>
                  <Typography variant="body1">
                    {customer.mobile}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Loyalty Tier
                  </Typography>
                  <Chip 
                    label={customer.tier} 
                    color={
                      customer.tier === 'Purple' ? 'primary' :
                      customer.tier === 'Gold' ? 'secondary' : 'default'
                    }
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Available Points
                  </Typography>
                  <Typography variant="body1">
                    {customer.available_points}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper>
            <Box p={3}>
              <Box display="flex" alignItems="center" mb={2}>
                <ShoppingBag color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Purchased Products
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {products && products.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Discount</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">
                          ${parseFloat(product.amount / product.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {product.discount > 0 ? `${product.discount}%` : '-'}
                          </TableCell>
                          <TableCell align="right">${parseFloat(product.amount).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="subtitle2">Subtotal</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                          ${parseFloat(transaction.total_amount).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  No product details available for this transaction.
                </Typography>
              )}
            </Box>
          </Paper>
          
          <Box mt={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Loyalty Impact
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: 'background.neutral', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Points Earned in this Transaction
                      </Typography>
                      <Chip 
                        label={`+${transaction.points_earned}`}
                        color="success"
                        sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                      />
                    </Paper>
                  </Grid>
                  
                  {transaction.points_redeemed > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.neutral', textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Points Redeemed in this Transaction
                        </Typography>
                        <Chip 
                          label={`-${transaction.points_redeemed}`}
                          color="primary"
                          sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                        />
                      </Paper>
                    </Grid>
                  )}
                </Grid>
                
                {customer && (
                  <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>
                      Customer's Current Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Current Tier
                          </Typography>
                          <Typography variant="body1">
                            <Chip 
                              label={customer.tier}
                              color={
                                customer.tier === 'Purple' ? 'primary' :
                                customer.tier === 'Gold' ? 'secondary' : 'default'
                              }
                            />
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, bgcolor: 'background.neutral' }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Available Points Balance
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {customer.available_points} points
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionDetails;