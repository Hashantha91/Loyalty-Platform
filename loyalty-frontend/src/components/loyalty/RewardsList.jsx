import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CardGiftcard,
  EmojiEvents
} from '@mui/icons-material';
import { AlertContext } from '../../context/AlertContext';
import loyaltyService from '../../services/loyaltyService';
import Loader from '../common/Loader';

const RewardsList = () => {
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  
  useEffect(() => {
    fetchRewards();
  }, []);
  
  const fetchRewards = async () => {
    try {
      setLoading(true);
      const data = await loyaltyService.getAllRewards();
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to fetch rewards'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddReward = () => {
    navigate('/loyalty/rewards/add');
  };
  
  const handleEditReward = (id) => {
    navigate(`/loyalty/rewards/${id}`);
  };
  
  const handleDeleteDialogOpen = (reward) => {
    setRewardToDelete(reward);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setRewardToDelete(null);
  };
  
  const handleDeleteReward = async () => {
    if (rewardToDelete) {
      try {
        await loyaltyService.deleteReward(rewardToDelete.reward_id);
        setRewards(rewards.filter(reward => reward.reward_id !== rewardToDelete.reward_id));
        setAlert({
          show: true,
          severity: 'success',
          message: 'Reward deleted successfully'
        });
        handleDeleteDialogClose();
      } catch (error) {
        console.error('Error deleting reward:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to delete reward'
        });
      }
    }
  };
  
  const handleToggleActivation = async (reward) => {
    try {
      const updatedReward = {
        ...reward,
        active: !reward.active
      };
      
      await loyaltyService.updateReward(reward.reward_id, updatedReward);
      
      // Update rewards list
      setRewards(rewards.map(r => 
        r.reward_id === reward.reward_id ? { ...r, active: !r.active } : r
      ));
      
      setAlert({
        show: true,
        severity: 'success',
        message: `Reward ${reward.active ? 'deactivated' : 'activated'} successfully`
      });
    } catch (error) {
      console.error('Error updating reward status:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'Failed to update reward status'
      });
    }
  };
  
  const handleShowInactiveToggle = () => {
    setShowInactive(!showInactive);
  };
  
  const filteredRewards = showInactive 
    ? rewards 
    : rewards.filter(reward => reward.active);
  
  if (loading) {
    return <Loader message="Loading rewards..." />;
  }
  
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Loyalty Rewards
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={handleShowInactiveToggle}
                color="primary"
              />
            }
            label="Show Inactive"
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddReward}
          >
            Add Reward
          </Button>
        </Box>
      </Box>
      
      {filteredRewards.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 5, py: 5 }}>
          <CardGiftcard sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Rewards Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {showInactive
              ? "You haven't created any rewards yet."
              : "You don't have any active rewards. Toggle 'Show Inactive' to see all rewards."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddReward}
          >
            Add Your First Reward
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRewards.map((reward) => (
            <Grid item xs={12} sm={6} md={4} key={reward.reward_id}>
              <Card 
                sx={{ 
                  height: '100%',
                  opacity: reward.active ? 1 : 0.7, 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {!reward.active && (
                  <Chip
                    label="Inactive"
                    color="default"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 1
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <EmojiEvents color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" noWrap>
                      {reward.reward_name}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {reward.description || 'No description provided'}
                  </Typography>
                  
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.neutral',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h4" color="primary" gutterBottom>
                      {reward.points_required} Points
                    </Typography>
                    
                    {reward.discount_value && (
                      <Typography variant="body1">
                        {reward.discount_value}% Discount
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reward.active}
                        onChange={() => handleToggleActivation(reward)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={reward.active ? "Active" : "Inactive"}
                  />
                  
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEditReward(reward.reward_id)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteDialogOpen(reward)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the reward "{rewardToDelete?.reward_name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteReward} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RewardsList;