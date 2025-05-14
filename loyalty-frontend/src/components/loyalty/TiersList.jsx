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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowUpward
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import loyaltyService from '../../services/loyaltyService';
import Loader from '../common/Loader';

const TiersList = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState(null);
  
  useEffect(() => {
    fetchTiers();
  }, []);
  
  const fetchTiers = async () => {
    try {
      setLoading(true);
      const data = await loyaltyService.getAllTiers();
      
      // Sort tiers by threshold
      const sortedTiers = [...data].sort((a, b) => a.threshold - b.threshold);
      setTiers(sortedTiers);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch loyalty tiers'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTier = () => {
    navigate('/loyalty/tiers/add');
  };
  
  const handleEditTier = (id) => {
    navigate(`/loyalty/tiers/${id}`);
  };
  
  const handleDeleteDialogOpen = (tier) => {
    setTierToDelete(tier);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setTierToDelete(null);
  };
  
  const handleDeleteTier = async () => {
    if (tierToDelete) {
      try {
        await loyaltyService.deleteTier(tierToDelete.tier_id);
        setTiers(tiers.filter(tier => tier.tier_id !== tierToDelete.tier_id));
        setAlert({
          show: true,
          severity: 'success',
          message: 'Tier deleted successfully'
        });
        handleDeleteDialogClose();
      } catch (error) {
        console.error('Error deleting tier:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to delete tier'
        });
      }
    }
  };
  
  const getTierColor = (tierName) => {
    if (tierName === 'Purple') return 'primary';
    if (tierName === 'Gold') return 'secondary';
    if (tierName === 'Platinum') return 'default';
    return 'default';
  };
  
  if (loading) {
    return <Loader message="Loading tiers..." />;
  }
  
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" component="h2">
          Loyalty Tiers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddTier}
        >
          Add Tier
        </Button>
      </Box>
      
      {/* Tier Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {tiers.map((tier, index) => (
          <Grid item xs={12} sm={6} md={4} key={tier.tier_id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                borderLeft: '4px solid',
                borderColor: 
                  tier.tier_name === 'Purple' ? 'primary.main' : 
                  tier.tier_name === 'Gold' ? 'secondary.main' : 
                  'grey.400'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip 
                    label={tier.tier_name} 
                    color={getTierColor(tier.tier_name)}
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {index === 0 ? "Entry Level" : `${tier.threshold} Points`}
                  </Typography>
                </Box>
                
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {tier.discount}% Discount
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {tier.description || 'No description provided'}
                </Typography>
                
                <Box display="flex" justifyContent="flex-end">
                  <Tooltip title="Edit Tier">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleEditTier(tier.tier_id)}
                      sx={{ mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete Tier">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteDialogOpen(tier)}
                      disabled={tiers.length <= 1} // Don't allow deleting the last tier
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Tier Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tier Name</TableCell>
                <TableCell>Point Threshold</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.tier_id}>
                  <TableCell>
                    <Chip 
                      label={tier.tier_name} 
                      color={getTierColor(tier.tier_name)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{tier.threshold}</TableCell>
                  <TableCell>{tier.discount}%</TableCell>
                  <TableCell>{tier.description || '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleEditTier(tier.tier_id)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleDeleteDialogOpen(tier)}
                        disabled={tiers.length <= 1} // Don't allow deleting the last tier
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {tierToDelete?.tier_name} tier?
            This action cannot be undone and may affect customers currently in this tier.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTier} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TiersList;