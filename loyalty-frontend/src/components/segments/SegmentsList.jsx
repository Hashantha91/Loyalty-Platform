import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Search,
  Clear,
  GetApp,
  Groups
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import segmentService from '../../services/segmentService';
import Loader from '../common/Loader';
import { format } from 'date-fns';

const SegmentsList = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSegments, setFilteredSegments] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState(null);
  
  useEffect(() => {
    fetchSegments();
  }, []);
  
  const fetchSegments = async () => {
    try {
      setLoading(true);
      const data = await segmentService.getAllSegments();
      setSegments(data);
      setFilteredSegments(data);
    } catch (error) {
      console.error('Error fetching segments:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch segments'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSegments(segments);
    } else {
      const filtered = segments.filter(
        segment => segment.segment_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSegments(filtered);
    }
  }, [searchTerm, segments]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const handleAddSegment = () => {
    navigate('/segments/add');
  };
  
  const handleViewSegment = (id) => {
    navigate(`/segments/${id}`);
  };
  
  const handleEditSegment = (id) => {
    navigate(`/segments/${id}/edit`);
  };
  
  const handleDeleteDialogOpen = (segment) => {
    setSegmentToDelete(segment);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSegmentToDelete(null);
  };
  
  const handleDeleteSegment = async () => {
    if (segmentToDelete) {
      try {
        await segmentService.deleteSegment(segmentToDelete.segment_id);
        setSegments(segments.filter(segment => segment.segment_id !== segmentToDelete.segment_id));
        setAlert({
          show: true,
          severity: 'success',
          message: 'Segment deleted successfully'
        });
        handleDeleteDialogClose();
      } catch (error) {
        console.error('Error deleting segment:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to delete segment'
        });
      }
    }
  };
  
  const handleExportSegment = async (id) => {
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
  
  if (loading) {
    return <Loader message="Loading segments..." />;
  }
  
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" component="h2">
          Customer Segments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddSegment}
        >
          Create Segment
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box display="flex" alignItems="center">
          <TextField
            label="Search Segments"
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
      
      {filteredSegments.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 5, py: 5 }}>
          <Groups sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Segments Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 
              "No segments match your search criteria." : 
              "You haven't created any customer segments yet."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddSegment}
          >
            Create Your First Segment
          </Button>
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Segment Name</TableCell>
                  <TableCell>Customer Count</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSegments.map((segment) => (
                  <TableRow key={segment.segment_id}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {segment.segment_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={segment.customer_count}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{segment.first_name} {segment.last_name}</TableCell>
                    <TableCell>{format(new Date(segment.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleViewSegment(segment.segment_id)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEditSegment(segment.segment_id)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export">
                        <IconButton 
                          color="success" 
                          size="small"
                          onClick={() => handleExportSegment(segment.segment_id)}
                        >
                          <GetApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteDialogOpen(segment)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the segment "{segmentToDelete?.segment_name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSegment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SegmentsList;