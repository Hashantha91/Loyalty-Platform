import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Search,
  Clear,
  GetApp
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { AlertContext } from '../../context/AlertContext';
import customerService from '../../services/customerService';
import Loader from '../common/Loader';

const CustomersList = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
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
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        customer =>
          customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.mobile.includes(searchTerm) ||
          (customer.identification_no && customer.identification_no.includes(searchTerm))
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
  
  const handleAddCustomer = () => {
    navigate('/customers/add');
  };
  
  const handleViewCustomer = (id) => {
    navigate(`/customers/${id}`);
  };
  
  const handleEditCustomer = (id) => {
    navigate(`/customers/${id}?edit=true`);
  };
  
  const handleDeleteDialogOpen = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };
  
  const handleDeleteCustomer = async () => {
    if (customerToDelete) {
      try {
        await customerService.deleteCustomer(customerToDelete.customer_id);
        setCustomers(customers.filter(
          customer => customer.customer_id !== customerToDelete.customer_id
        ));
        setAlert({
          show: true,
          severity: 'success',
          message: 'Customer deleted successfully'
        });
        handleDeleteDialogClose();
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
  
  const exportCustomerData = () => {
    // Create CSV from filtered customers
    const headers = ["Customer ID", "First Name", "Last Name", "Email", "Mobile", "Tier", "Available Points"];
    const csvData = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.customer_id,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.mobile,
        customer.tier,
        customer.available_points
      ].join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setAlert({
      show: true,
      severity: 'success',
      message: 'Customer data exported successfully'
    });
  };
  
  const columns = [
    { field: 'customer_id', headerName: 'ID', width: 70 },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      valueGetter: (params) => `${params.row.first_name} ${params.row.last_name}`,
      sortComparator: (v1, v2) => v1.localeCompare(v2)
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
      field: 'join_date',
      headerName: 'Join Date',
      width: 150,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      }
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
              onClick={() => handleDeleteDialogOpen(params.row)}
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
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" component="h2">
          Customers
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={exportCustomerData}
            sx={{ mr: 2 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCustomer}
          >
            Add Customer
          </Button>
        </Box>
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete customer {customerToDelete ? `${customerToDelete.first_name} ${customerToDelete.last_name}` : ''}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteCustomer} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomersList;