import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText
} from '@mui/material';
import {
  Save,
  Cancel,
  ExpandMore,
  FilterList,
  Groups
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AlertContext } from '../../context/AlertContext';
import segmentService from '../../services/segmentService';
import loyaltyService from '../../services/loyaltyService';

const SegmentForm = ({ segment, onSuccess, onCancel }) => {
  const { setAlert } = useContext(AlertContext);
  const isEditMode = Boolean(segment);
  
  const [formData, setFormData] = useState({
    segment_name: '',
    criteria: {
      tier: '',
      min_points: '',
      max_points: '',
      join_date_from: null,
      join_date_to: null
    }
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [showMinPoints, setShowMinPoints] = useState(false);
  const [showMaxPoints, setShowMaxPoints] = useState(false);
  const [showJoinDate, setShowJoinDate] = useState(false);
  
  useEffect(() => {
    // Fetch loyalty tiers
    const fetchTiers = async () => {
      try {
        const tiersData = await loyaltyService.getAllTiers();
        setTiers(tiersData);
      } catch (error) {
        console.error('Error fetching tiers:', error);
        setAlert({
          show: true,
          severity: 'error',
          message: 'Failed to fetch loyalty tiers'
        });
      }
    };
    
    fetchTiers();
    
    // Pre-fill form if in edit mode
    if (isEditMode && segment) {
      const { segment_name, criteria } = segment;
      
      setFormData({
        segment_name: segment_name || '',
        criteria: {
          tier: criteria.tier || '',
          min_points: criteria.min_points || '',
          max_points: criteria.max_points || '',
          join_date_from: criteria.join_date_from ? new Date(criteria.join_date_from) : null,
          join_date_to: criteria.join_date_to ? new Date(criteria.join_date_to) : null
        }
      });
      
      // Set filter visibility based on existing criteria
      setShowMinPoints(Boolean(criteria.min_points));
      setShowMaxPoints(Boolean(criteria.max_points));
      setShowJoinDate(Boolean(criteria.join_date_from) || Boolean(criteria.join_date_to));
    }
  }, [segment, isEditMode, setAlert]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleCriteriaChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      criteria: {
        ...formData.criteria,
        [name]: value
      }
    });
    
    // Clear error when field is changed
    if (errors[`criteria.${name}`]) {
      setErrors({
        ...errors,
        [`criteria.${name}`]: null
      });
    }
  };
  
  const handleDateChange = (name) => (date) => {
    setFormData({
      ...formData,
      criteria: {
        ...formData.criteria,
        [name]: date
      }
    });
    
    // Clear error when field is changed
    if (errors[`criteria.${name}`]) {
      setErrors({
        ...errors,
        [`criteria.${name}`]: null
      });
    }
  };
  
  const toggleFilterSwitch = (filterName, currentState) => () => {
    switch (filterName) {
      case 'min_points':
        setShowMinPoints(!currentState);
        if (currentState) {
          // Clear the value when disabling the filter
          setFormData({
            ...formData,
            criteria: {
              ...formData.criteria,
              min_points: ''
            }
          });
        }
        break;
        
      case 'max_points':
        setShowMaxPoints(!currentState);
        if (currentState) {
          setFormData({
            ...formData,
            criteria: {
              ...formData.criteria,
              max_points: ''
            }
          });
        }
        break;
        
      case 'join_date':
        setShowJoinDate(!currentState);
        if (currentState) {
          setFormData({
            ...formData,
            criteria: {
              ...formData.criteria,
              join_date_from: null,
              join_date_to: null
            }
          });
        }
        break;
        
      default:
        break;
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate segment name
    if (!formData.segment_name) {
      newErrors['segment_name'] = 'Segment name is required';
    }
    
    // Validate min points is a number
    if (showMinPoints && formData.criteria.min_points !== '' && isNaN(Number(formData.criteria.min_points))) {
      newErrors['criteria.min_points'] = 'Minimum points must be a number';
    }
    
    // Validate max points is a number
    if (showMaxPoints && formData.criteria.max_points !== '' && isNaN(Number(formData.criteria.max_points))) {
      newErrors['criteria.max_points'] = 'Maximum points must be a number';
    }
    
    // Validate min points is less than max points if both are specified
    if (
      showMinPoints && 
      showMaxPoints && 
      formData.criteria.min_points !== '' && 
      formData.criteria.max_points !== '' &&
      Number(formData.criteria.min_points) > Number(formData.criteria.max_points)
    ) {
      newErrors['criteria.max_points'] = 'Maximum points must be greater than minimum points';
    }
    
    // Validate join date range if both dates are specified
    if (
      showJoinDate && 
      formData.criteria.join_date_from && 
      formData.criteria.join_date_to &&
      new Date(formData.criteria.join_date_from) > new Date(formData.criteria.join_date_to)
    ) {
      newErrors['criteria.join_date_to'] = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const prepareDataForSubmission = () => {
    const submissionData = {
      segment_name: formData.segment_name,
      criteria: {}
    };
    
    // Only include criteria that are enabled and have values
    if (formData.criteria.tier) {
      submissionData.criteria.tier = formData.criteria.tier;
    }
    
    if (showMinPoints && formData.criteria.min_points !== '') {
      submissionData.criteria.min_points = Number(formData.criteria.min_points);
    }
    
    if (showMaxPoints && formData.criteria.max_points !== '') {
      submissionData.criteria.max_points = Number(formData.criteria.max_points);
    }
    
    if (showJoinDate && formData.criteria.join_date_from) {
      submissionData.criteria.join_date_from = formData.criteria.join_date_from;
    }
    
    if (showJoinDate && formData.criteria.join_date_to) {
      submissionData.criteria.join_date_to = formData.criteria.join_date_to;
    }
    
    return submissionData;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Please fix the errors in the form'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const dataToSubmit = prepareDataForSubmission();
      let result;
      
      if (isEditMode) {
        // Update existing segment
        result = await segmentService.updateSegment(segment.segment_id, dataToSubmit);
        
        setAlert({
          show: true,
          severity: 'success',
          message: 'Segment updated successfully'
        });
      } else {
        // Create new segment
        result = await segmentService.createSegment(dataToSubmit);
        
        setAlert({
          show: true,
          severity: 'success',
          message: 'Segment created successfully'
        });
        
        // Reset form
        setFormData({
          segment_name: '',
          criteria: {
            tier: '',
            min_points: '',
            max_points: '',
            join_date_from: null,
            join_date_to: null
          }
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error saving segment:', error);
      setAlert({
        show: true,
        severity: 'error',
        message: error.response?.data?.message || 'Failed to save segment'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Groups color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">
          {isEditMode ? 'Edit Segment' : 'Create Customer Segment'}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="segment_name"
              label="Segment Name"
              value={formData.segment_name}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.segment_name)}
              helperText={errors.segment_name || 'Give your segment a descriptive name'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Segment Criteria
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="tier-filter-content"
                id="tier-filter-header"
              >
                <FilterList sx={{ mr: 1 }} />
                <Typography>Tier Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <InputLabel id="tier-select-label">Loyalty Tier</InputLabel>
                  <Select
                    labelId="tier-select-label"
                    id="tier-select"
                    name="tier"
                    value={formData.criteria.tier}
                    onChange={handleCriteriaChange}
                    label="Loyalty Tier"
                  >
                    <MenuItem value="">
                      <em>All Tiers</em>
                    </MenuItem>
                    {tiers.map((tier) => (
                      <MenuItem key={tier.tier_id} value={tier.tier_name}>
                        {tier.tier_name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Filter customers by their loyalty tier</FormHelperText>
                </FormControl>
              </AccordionDetails>
            </Accordion>
            
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="points-filter-content"
                id="points-filter-header"
              >
                <FilterList sx={{ mr: 1 }} />
                <Typography>Points Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showMinPoints}
                          onChange={toggleFilterSwitch('min_points', showMinPoints)}
                          color="primary"
                        />
                      }
                      label="Minimum Points"
                    />
                    
                    {showMinPoints && (
                      <TextField
                        name="min_points"
                        label="Minimum Points"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={formData.criteria.min_points}
                        onChange={handleCriteriaChange}
                        fullWidth
                        error={Boolean(errors['criteria.min_points'])}
                        helperText={errors['criteria.min_points']}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showMaxPoints}
                          onChange={toggleFilterSwitch('max_points', showMaxPoints)}
                          color="primary"
                        />
                      }
                      label="Maximum Points"
                    />
                    
                    {showMaxPoints && (
                      <TextField
                        name="max_points"
                        label="Maximum Points"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={formData.criteria.max_points}
                        onChange={handleCriteriaChange}
                        fullWidth
                        error={Boolean(errors['criteria.max_points'])}
                        helperText={errors['criteria.max_points']}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="join-date-filter-content"
                id="join-date-filter-header"
              >
                <FilterList sx={{ mr: 1 }} />
                <Typography>Join Date Filter</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showJoinDate}
                          onChange={toggleFilterSwitch('join_date', showJoinDate)}
                          color="primary"
                        />
                      }
                      label="Filter by Join Date"
                    />
                  </Grid>
                  
                  {showJoinDate && (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="From Date"
                          value={formData.criteria.join_date_from}
                          onChange={handleDateChange('join_date_from')}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(errors['criteria.join_date_from']),
                              helperText: errors['criteria.join_date_from']
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="To Date"
                          value={formData.criteria.join_date_to}
                          onChange={handleDateChange('join_date_to')}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(errors['criteria.join_date_to']),
                              helperText: errors['criteria.join_date_to']
                            }
                          }}
                        />
                      </Grid>
                    </LocalizationProvider>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Cancel />}
              onClick={onCancel}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={loading}
          >
            {isEditMode ? 'Update Segment' : 'Create Segment'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SegmentForm;