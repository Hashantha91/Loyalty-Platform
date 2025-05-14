import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  GetApp,
  Search,
  Clear,
  FilterList,
  CalendarToday,
  Person,
  Star
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AlertContext } from '../../context/AlertContext';
import segmentService from '../../services/segmentService';
import Loader from '../common/Loader';

const SegmentDetails = () => {
  const { id } = useParams();
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [segment, setSegment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    fetchSegmentDetails();
  }, [id]);
  
  const fetchSegmentDetails = async () => {
    try {
      setLoading(true);
      const data = await segmentService.getSegmentById(id);
      setSegment(data);
      setFilteredCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching segment details:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch segment details'
      });
      // Navigate back to segments list on error
      navigate('/segments');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (segment && segment.customers) {
      if (searchTerm.trim() === '') {
        setFilteredCustomers(segment.customers);
      } else {
        const filtered = segment.customers.filter(
          customer =>
            customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.mobile && customer.mobile.includes(searchTerm))
        );
        setFilteredCustomers(filtered);
      }
      // Reset to first page when search changes
      setPage(0);
    }
  }, [searchTerm, segment]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleGoBack = () => {
    navigate('/segments');
  };
  
  const handleEdit = () => {
    navigate(`/segments/${id}/edit`);
  };
  
  const handleExport = async () => {
    try {
      setLoading(true);
      
      const segmentData = await segmentService.exportSegment(id);
      
      // Convert segment data to CSV
      const headers = ["Customer ID", "First Name", "Last Name", "Email", "Mobile", "Address", "Tier", "Available Points"];
      const csvData = [
        headers.join(','),
        ...segmentData.customers.map(customer => [
          customer.customer_id,
          customer.first_name,
          customer.last_name,
          customer.email,
          customer.mobile,
          customer.address ? customer.address.replace(/,/g, ' ') : '', // Remove commas from address
          customer.tier,
          customer.available_points
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `segment_${segmentData.segment_name}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setAlert({
        show: true,
        severity: 'success',
        message: 'Segment exported successfully'
      });
      
    } catch (error) {
      console.error('Error exporting segment:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to export segment'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatCriteriaText = (criteria) => {
    if (!criteria) return 'No criteria defined';
    
    const parts = [];
    
    if (criteria.tier) {
      parts.push(`Tier: ${criteria.tier}`);
    }
    
    if (criteria.min_points) {
      parts.push(`Min Points: ${criteria.min_points}`);
    }
    
    if (criteria.max_points) {
      parts.push(`Max Points: ${criteria.max_points}`);
    }
    
    if (criteria.join_date_from) {
      parts.push(`Joined After: ${format(new Date(criteria.join_date_from), 'MMM d, yyyy')}`);
    }
    
    if (criteria.join_date_to) {
      parts.push(`Joined Before: ${format(new Date(criteria.join_date_to), 'MMM d, yyyy')}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'All Customers';
  };
  
  if (loading) {
    return <Loader message="Loading segment details..." />;
  }
  
  if (!segment) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" color="error" gutterBottom>
          Segment not found
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Back to Segments
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
          Segment Details
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<Edit />} 
          onClick={handleEdit}
          sx={{ mr: 2 }}
        >
          Edit
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<GetApp />} 
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Segment Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Segment Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {segment.segment_name}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Customer Count
                </Typography>
                <Chip
                  label={segment.customer_count}
                  color="primary"
                  sx={{ fontWeight: 'bold', mt: 0.5 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created By
                </Typography>
                <Typography variant="body1">
                  {segment.first_name} {segment.last_name}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(segment.created_at), 'MMMM d, yyyy')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Segment Criteria
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatCriteriaText(segment.criteria)}
              </Typography>
              
              <Grid container spacing={2}>
                {segment.criteria?.tier && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <Star color="secondary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Tier
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {segment.criteria.tier}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {segment.criteria?.min_points && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <FilterList color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Min Points
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {segment.criteria.min_points}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {segment.criteria?.max_points && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <FilterList color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Max Points
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {segment.criteria.max_points}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {segment.criteria?.join_date_from && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <CalendarToday color="info" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Joined After
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {format(new Date(segment.criteria.join_date_from), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                
                {segment.criteria?.join_date_to && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <CalendarToday color="info" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Joined Before
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {format(new Date(segment.criteria.join_date_to), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Customers in Segment
          </Typography>
          <TextField
            placeholder="Search customers..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ width: 300 }}
          />
        </Box>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer) => (
                    <TableRow key={customer.customer_id}>
                      <TableCell>
                        {customer.first_name} {customer.last_name}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.mobile}</TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.tier} 
                          color={
                            customer.tier === 'Purple' ? 'primary' :
                            customer.tier === 'Gold' ? 'secondary' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{customer.available_points}</TableCell>
                      <TableCell>
                        {customer.join_date ? format(new Date(customer.join_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Customer Details">
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => navigate(`/customers/${customer.customer_id}`)}
                          >
                            <Person fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" sx={{ py: 2 }}>
                      {searchTerm 
                        ? "No customers match your search criteria."
                        : "No customers found in this segment."
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default SegmentDetails;