import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People,
  CardGiftcard,
  Timeline,
  Receipt,
  TrendingUp,
  AddCircleOutline,
  ArrowForward,
  Refresh
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertContext } from '../../context/AlertContext';
import customerService from '../../services/customerService';
import loyaltyService from '../../services/loyaltyService';
import transactionService from '../../services/transactionService';
import segmentService from '../../services/segmentService';
import Loader from '../common/Loader';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { getTierColor } from '../../utils/helpers';

const Dashboard = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRewards: 0,
    totalTiers: 0,
    totalTransactions: 0,
    totalSegments: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    recentTransactions: []
  });
  
  const [tierDistribution, setTierDistribution] = useState([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Fetch customers
      const customers = await customerService.getAllCustomers();
      
      // Fetch rewards
      const rewards = await loyaltyService.getAllRewards();
      
      // Fetch tiers
      const tiers = await loyaltyService.getAllTiers();
      
      // Fetch transactions
      const transactions = await transactionService.getAllTransactions();
      
      // Fetch segments
      const segments = await segmentService.getAllSegments();
      
      // Calculate total points
      const totalPointsEarned = transactions.reduce((sum, transaction) => sum + transaction.points_earned, 0);
      const totalPointsRedeemed = transactions.reduce((sum, transaction) => sum + transaction.points_redeemed, 0);
      
      // Get recent transactions (last 5)
      const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date))
        .slice(0, 5);
      
      // Set stats
      setStats({
        totalCustomers: customers.length,
        totalRewards: rewards.length,
        totalTiers: tiers.length,
        totalTransactions: transactions.length,
        totalSegments: segments.length,
        totalPointsEarned,
        totalPointsRedeemed,
        recentTransactions
      });
      
      // Calculate tier distribution
      const tierCounts = {};
      tiers.forEach(tier => {
        tierCounts[tier.tier_name] = 0;
      });
      
      customers.forEach(customer => {
        if (tierCounts[customer.tier] !== undefined) {
          tierCounts[customer.tier]++;
        }
      });
      
      const tierData = Object.keys(tierCounts).map(tierName => ({
        name: tierName,
        customers: tierCounts[tierName]
      }));
      
      setTierDistribution(tierData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    fetchDashboardData();
  };
  
  if (loading && !refreshing) {
    return <Loader message="Loading dashboard data..." />;
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            color="primary"
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'primary.main'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Customers
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(stats.totalCustomers)}
                  </Typography>
                </Box>
                <People color="primary" />
              </Box>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/customers')}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'secondary.main'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Rewards
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(stats.totalRewards)}
                  </Typography>
                </Box>
                <CardGiftcard color="secondary" />
              </Box>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/loyalty/rewards')}
              >
                Manage Rewards
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'error.main'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Loyalty Tiers
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(stats.totalTiers)}
                  </Typography>
                </Box>
                <Timeline color="error" />
              </Box>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/loyalty/tiers')}
              >
                View Tiers
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'info.main'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Transactions
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(stats.totalTransactions)}
                  </Typography>
                </Box>
                <Receipt color="info" />
              </Box>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/transactions')}
              >
                View Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'success.main'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Segments
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(stats.totalSegments)}
                  </Typography>
                </Box>
                <TrendingUp color="success" />
              </Box>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/segments')}
              >
                View Segments
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'warning.main'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Points
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatNumber(stats.totalPointsEarned)}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="flex-end">
                  <Typography variant="caption" color="success.main">
                    +{formatNumber(stats.totalPointsEarned)}
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    -{formatNumber(stats.totalPointsRedeemed)}
                  </Typography>
                </Box>
              </Box>
              <Button 
                size="small" 
                sx={{ mt: 2 }} 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/loyalty/points')}
              >
                Points Structure
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tier Distribution and Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Customer Tier Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {tierDistribution.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tierDistribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      dataKey="customers" 
                      name="Customers" 
                      fill="#8884d8"
                      barSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="textSecondary">
                  No tier data available
                </Typography>
              </Box>
            )}
            
            <Box mt={2}>
              <Grid container spacing={1}>
                {tierDistribution.map((tier) => (
                  <Grid item key={tier.name} xs={12} sm={4}>
                    <Box display="flex" alignItems="center">
                      <Chip 
                        label={tier.name} 
                        color={getTierColor(tier.name)} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {tier.customers} customer{tier.customers !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddCircleOutline />}
                sx={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/customers/add')}
              >
                Add New Customer
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Receipt />}
                sx={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/transactions/add')}
              >
                Record Transaction
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<TrendingUp />}
                sx={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/segments/add')}
              >
                Create Customer Segment
              </Button>
              
              <Button
                variant="outlined"
                color="info"
                startIcon={<CardGiftcard />}
                sx={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/loyalty/rewards/add')}
              >
                Add New Reward
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Transactions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {stats.recentTransactions.length > 0 ? (
          <Grid container spacing={3}>
            {stats.recentTransactions.map((transaction) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={transaction.invoice_id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={transaction.invoice_id} 
                        color="info" 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(transaction.invoice_date)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" gutterBottom>
                      Customer ID: {transaction.customer_id}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>
                      {formatCurrency(transaction.total_amount)}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        {transaction.points_earned > 0 && (
                          <Chip 
                            label={`+${transaction.points_earned}`} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        
                        {transaction.points_redeemed > 0 && (
                          <Chip 
                            label={`-${transaction.points_redeemed}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                      
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/transactions/${transaction.invoice_id}`)}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              No recent transactions found
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={() => navigate('/transactions/add')}
              sx={{ mt: 2 }}
            >
              Record First Transaction
            </Button>
          </Box>
        )}
        
        {stats.recentTransactions.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/transactions')}
            >
              View All Transactions
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;