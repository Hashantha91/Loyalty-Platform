import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  ArrowBack,
  CardGiftcard,
  Timeline,
  Receipt,
  Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AlertContext } from '../../context/AlertContext';
import customerService from '../../services/customerService';
import loyaltyService from '../../services/loyaltyService';
import transactionService from '../../services/transactionService';
import Loader from '../common/Loader';
import CustomerForm from './CustomerForm';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [tierProgress, setTierProgress] = useState({
    currentTier: null,
    nextTier: null,
    percentage: 0,
    pointsToNext: 0
  });
  const [editMode, setEditMode] = useState(isEditMode);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchCustomerData();
  }, [id]);
  
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      // Get customer details
      const customerData = await customerService.getCustomerById(id);
      setCustomer(customerData);
      
      // Get loyalty history
      const historyData = await customerService.getCustomerLoyaltyHistory(id);
      setLoyaltyHistory(historyData);
      
      // Get transactions
      const transactionsData = await customerService.getCustomerTransactions(id);
      setTransactions(transactionsData);
      
      // Get loyalty tiers for progress calculation
      const tiersData = await loyaltyService.getAllTiers();
      setTiers(tiersData);
      
      // Calculate tier progress
      calculateTierProgress(customerData, tiersData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch customer details'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const calculateTierProgress = (customer, tiers) => {
    if (!customer || !tiers || tiers.length === 0) return;
    
    // Sort tiers by threshold
    const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
    
    // Find current tier
    const currentTierIndex = sortedTiers.findIndex(tier => tier.tier_name === customer.tier);
    const currentTier = sortedTiers[currentTierIndex];
    
    // If on highest tier, set 100% progress
    if (currentTierIndex === sortedTiers.length - 1) {
      setTierProgress({
        currentTier,
        nextTier: null,
        percentage: 100,
        pointsToNext: 0
      });
      return;
    }
    
    // Calculate progress to next tier
    const nextTier = sortedTiers[currentTierIndex + 1];
    const pointsForNextTier = nextTier.threshold;
    const currentPoints = customer.available_points;
    const startPoints = currentTier.threshold;
    
    const pointsNeeded = pointsForNextTier - startPoints;
    const pointsEarned = currentPoints - startPoints;
    const progressPercentage = Math.min(100, Math.round((pointsEarned / pointsNeeded) * 100));
    const pointsToNext = Math.max(0, pointsForNextTier - currentPoints);
    
    setTierProgress({
      currentTier,
      nextTier,
      percentage: progressPercentage,
      pointsToNext
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleGoBack = () => {
    navigate('/customers');
  };
  
  const handleEditToggle = () => {
    setEditMode(!editMode);
  };
  
  const handleUpdateSuccess = (updatedCustomer) => {
    setCustomer(updatedCustomer);
    setEditMode(false);
    setAlert({
      show: true,
      severity: 'success',
      message: 'Customer updated successfully'
    });
  };
  
  const handleUpdateCancel = () => {
    setEditMode(false);
  };
  
  const handleRefreshTier = async () => {
    try {
      setRefreshing(true);
      const result = await loyaltyService.updateCustomerTier(id);
      
      // Refresh customer data to get updated tier
      fetchCustomerData();
      
      setAlert({
        show: true,
        severity: 'success',
        message: `Customer tier updated to ${result.tier}`
      });
    } catch (error) {
      console.error('Error updating tier:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to update customer tier'
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  if (loading) {
    return <Loader message="Loading customer details..." />;
  }
  
  if (!customer) {
    return (
      <Box mt={4} textAlign="center">
        <Typography variant="h5" color="error">
          Customer not found
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
          sx={{ mt: 2 }}
        >
          Back to Customers
        </Button>
      </Box>
    );
  }
  
  if (editMode) {
    return (
      <Box>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleUpdateCancel}
          sx={{ mb: 3 }}
        >
          Cancel Edit
        </Button>
        <CustomerForm 
          customer={customer}
          onSuccess={handleUpdateSuccess}
          onCancel={handleUpdateCancel}
        />
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
          Customer Details
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Edit />} 
          onClick={handleEditToggle}
        >
          Edit Customer
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={4} sx={{ p: 3, borderRight: { md: '1px solid #eee' } }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography variant="h3" color="white">
                  {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                </Typography>
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {customer.first_name} {customer.last_name}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={1}>
                <Chip 
                  label={customer.tier} 
                  color={
                    customer.tier === 'Purple' ? 'primary' :
                    customer.tier === 'Gold' ? 'secondary' : 'default'
                  }
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 1
                  }}
                />
                <Tooltip title="Refresh Tier">
                  <IconButton
                    size="small"
                    onClick={handleRefreshTier}
                    disabled={refreshing}
                    sx={{ ml: 1 }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Typography variant="body2" color="textSecondary">
                Member since {format(new Date(customer.join_date), 'MMMM d, yyyy')}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <Person color="action" sx={{ mr: 2 }} />
                <ListItemText
                  primary="Customer ID"
                  secondary={customer.customer_id}
                />
              </ListItem>
              
              <ListItem>
                <Email color="action" sx={{ mr: 2 }} />
                <ListItemText
                  primary="Email"
                  secondary={customer.email}
                />
              </ListItem>
              
              <ListItem>
                <Phone color="action" sx={{ mr: 2 }} />
                <ListItemText
                  primary="Mobile"
                  secondary={customer.mobile}
                />
              </ListItem>
              
              <ListItem>
                <LocationOn color="action" sx={{ mr: 2 }} />
                <ListItemText
                  primary="Address"
                  secondary={customer.address}
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Available Points
                      </Typography>
                      <Typography variant="h4" component="div">
                        {customer.available_points}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Earned
                      </Typography>
                      <Typography variant="h4" component="div">
                        {customer.earned_points}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Redeemed
                      </Typography>
                      <Typography variant="h4" component="div">
                        {customer.redeemed_points}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ my: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tier Progress
                </Typography>
                
                {tierProgress.nextTier ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {tierProgress.currentTier.tier_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {tierProgress.nextTier.tier_name}
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={tierProgress.percentage} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {tierProgress.percentage}% Complete
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {tierProgress.pointsToNext} points to next tier
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Highest tier achieved
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab 
                  icon={<CardGiftcard />}
                  iconPosition="start"
                  label="Loyalty History" 
                  id="customer-tab-0" 
                  aria-controls="customer-tabpanel-0" 
                />
                <Tab 
                  icon={<Receipt />}
                  iconPosition="start"
                  label="Transactions" 
                  id="customer-tab-1" 
                  aria-controls="customer-tabpanel-1" 
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {loyaltyHistory.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {loyaltyHistory.map((history, index) => (
                    <React.Fragment key={history.loyalty_id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {history.status === 'earned' ? 'Earned ' : 'Redeemed '}
                              <strong>{history.points}</strong> points
                              {history.invoice_id && ` (Invoice #${history.invoice_id})`}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="textSecondary">
                              {format(new Date(history.created_at), 'MMMM d, yyyy - h:mm a')}
                            </Typography>
                          }
                        />
                        <Chip
                          label={history.status}
                          color={history.status === 'earned' ? 'success' : 
                                 history.status === 'redeemed' ? 'primary' : 
                                 'default'}
                          size="small"
                        />
                      </ListItem>
                      {index < loyaltyHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
                  No loyalty history found for this customer.
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {transactions.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {transactions.map((transaction, index) => (
                    <React.Fragment key={transaction.invoice_id}>
                      <ListItem 
                        alignItems="flex-start" 
                        button
                        onClick={() => navigate(`/transactions/${transaction.invoice_id}`)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              Invoice #{transaction.invoice_id}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="textSecondary">
                                {format(new Date(transaction.invoice_date), 'MMMM d, yyyy - h:mm a')}
                              </Typography>
                              <Typography variant="body2">
                                Total: ${parseFloat(transaction.total_amount).toFixed(2)} | 
                                Points Earned: {transaction.points_earned} | 
                                Points Redeemed: {transaction.points_redeemed}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < transactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
                  No transactions found for this customer.
                </Typography>
              )}
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CustomerDetails;