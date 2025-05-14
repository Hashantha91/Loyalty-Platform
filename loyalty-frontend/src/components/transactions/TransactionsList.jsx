import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search,
  Clear,
  Visibility,
  Receipt,
  Add
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AlertContext } from '../../context/AlertContext';
import transactionService from '../../services/transactionService';
import Loader from '../common/Loader';

const TransactionsList = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState('all');
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getAllTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch transactions'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let results = [...transactions];
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      let filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          // Today
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          // Last 7 days
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          // Last 30 days
          filterDate.setDate(filterDate.getDate() - 30);
          break;
        default:
          break;
      }
      
      results = results.filter(transaction => {
        const transactionDate = new Date(transaction.invoice_date);
        return transactionDate >= filterDate;
      });
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      results = results.filter(
        transaction =>
          transaction.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.customer_id.toString().includes(searchTerm)
      );
    }
    
    setFilteredTransactions(results);
    setPage(0);
  }, [searchTerm, transactions, dateFilter]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewTransaction = (id) => {
    navigate(`/transactions/${id}`);
  };
  
  const handleAddTransaction = () => {
    navigate('/transactions/add');
  };
  
  if (loading) {
    return <Loader message="Loading transactions..." />;
  }
  
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" component="h2">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddTransaction}
        >
          Record Transaction
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <TextField
            label="Search Transactions"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={clearSearch}>
                  <Clear fontSize="small" />
                </IconButton>
              )
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="date-filter-label">Date Range</InputLabel>
            <Select
              labelId="date-filter-label"
              id="date-filter"
              value={dateFilter}
              label="Date Range"
              onChange={handleDateFilterChange}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            onClick={fetchTransactions}
          >
            Refresh
          </Button>
        </Box>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Customer ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Points Earned</TableCell>
                <TableCell>Points Redeemed</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                    <TableRow key={transaction.invoice_id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Receipt fontSize="small" color="action" sx={{ mr: 1 }} />
                          {transaction.invoice_id}
                        </Box>
                      </TableCell>
                      <TableCell>{transaction.customer_id}</TableCell>
                      <TableCell>
                        {format(new Date(transaction.invoice_date), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>${parseFloat(transaction.total_amount).toFixed(2)}</TableCell>
                      <TableCell>
                        {transaction.points_earned > 0 && (
                          <Chip 
                            label={`+${transaction.points_earned}`} 
                            size="small" 
                            color="success" 
                            variant="outlined" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.points_redeemed > 0 && (
                          <Chip 
                            label={`-${transaction.points_redeemed}`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Transaction">
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => handleViewTransaction(transaction.invoice_id)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="textSecondary">
                      {transactions.length === 0 
                        ? "No transactions found." 
                        : "No transactions match the current filters."}
                    </Typography>
                    {transactions.length === 0 && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={handleAddTransaction}
                        sx={{ mt: 1 }}
                      >
                        Record First Transaction
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
};

export default TransactionsList;