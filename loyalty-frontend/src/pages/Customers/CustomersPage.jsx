import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Search,
  Clear
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { AlertContext } from '../../context/AlertContext';
import customerService from '../../services/customerService';
import Loader from '../../components/common/Loader';

const CustomersPage = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await customerService.getAllCustomers();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to fetch customers'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [setAlert]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        customer =>
          customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.mobile.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const handleViewCustomer = (id) => {
    navigate(`/customers/${id}`);
  };
  
  const handleEditCustomer = (id) => {
    navigate(`/customers/${id}?edit=true`);
  };
  
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(id);
        setCustomers(customers.filter(customer => customer.customer_id !== id));
        setAlert({
          show: true,
          severity: 'success',
          message: 'Customer deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting customer:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to delete customer'
        });
      }
    }
  };
  
  const columns = [
    { field: 'customer_id', headerName: 'ID', width: 70 },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      valueGetter: (params) => `${params.row.first_name} ${params.row.last_name}`
    },
    { field: 'email', headerName: 'Email', width: 230 },
    { field: 'mobile', headerName: 'Mobile', width: 150 },
    {
      field: 'tier',
      headerName: 'Tier',
      width: 120,
      renderCell: (params) => {
        const tier = params.value;
        let color = 'default';
        
        if (tier === 'Purple') color = 'primary';
        if (tier === 'Gold') color = 'secondary';
        if (tier === 'Platinum') color = 'default';
        
        return (
          <Chip 
            label={tier} 
            color={color} 
            variant="outlined" 
            size="small" 
          />
        );
      }
    },
    {
      field: 'available_points',
      headerName: 'Points',
      type: 'number',
      width: 100
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton 
              color="info" 
              size="small"
              onClick={() => handleViewCustomer(params.row.customer_id)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              color="primary" 
              size="small"
              onClick={() => handleEditCustomer(params.row.customer_id)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              size="small"
              onClick={() => handleDeleteCustomer(params.row.customer_id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];
  
  if (loading) {
    return <Loader message="Loading customers..." />;
  }
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Customers
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Manage your loyalty program customers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/customers/add')}
        >
          Add Customer
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box display="flex" alignItems="center">
          <TextField
            label="Search Customers"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={clearSearch}>
                  <Clear fontSize="small" />
                </IconButton>
              )
            }}
          />
        </Box>
      </Paper>
      
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          getRowId={(row) => row.customer_id}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />
      </Paper>
    </Container>
  );
};

export default CustomersPage;