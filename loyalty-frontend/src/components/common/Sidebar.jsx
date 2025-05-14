import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  Collapse
} from '@mui/material';
import {
  Dashboard,
  People,
  CardGiftcard,
  Loyalty,
  LocalOffer,
  BarChart,
  ExpandLess,
  ExpandMore,
  Settings,
  Receipt,
  Group
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [openLoyalty, setOpenLoyalty] = React.useState(true);

  const handleLoyaltyClick = () => {
    setOpenLoyalty(!openLoyalty);
  };

  const isAdmin = user && user.role === 'Administrator';
  const isMarketing = user && (user.role === 'Administrator' || user.role === 'Marketing');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {/* Dashboard */}
          <ListItem 
            button 
            selected={location.pathname === '/'} 
            onClick={() => navigate('/')}
          >
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          {/* Customers */}
          <ListItem 
            button 
            selected={location.pathname.startsWith('/customers')} 
            onClick={() => navigate('/customers')}
          >
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText primary="Customers" />
          </ListItem>
          
          {/* Loyalty Section */}
          <ListItem button onClick={handleLoyaltyClick}>
            <ListItemIcon>
              <Loyalty />
            </ListItemIcon>
            <ListItemText primary="Loyalty Management" />
            {openLoyalty ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={openLoyalty} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Points Structure */}
              <ListItem 
                button 
                sx={{ pl: 4 }} 
                selected={location.pathname === '/loyalty/points'}
                onClick={() => navigate('/loyalty/points')}
              >
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Points Structure" />
              </ListItem>
              
              {/* Tiers */}
              <ListItem 
                button 
                sx={{ pl: 4 }} 
                selected={location.pathname.startsWith('/loyalty/tiers')}
                onClick={() => navigate('/loyalty/tiers')}
              >
                <ListItemIcon>
                  <BarChart />
                </ListItemIcon>
                <ListItemText primary="Tiers" />
              </ListItem>
              
              {/* Rewards */}
              <ListItem 
                button 
                sx={{ pl: 4 }} 
                selected={location.pathname.startsWith('/loyalty/rewards')}
                onClick={() => navigate('/loyalty/rewards')}
              >
                <ListItemIcon>
                  <CardGiftcard />
                </ListItemIcon>
                <ListItemText primary="Rewards" />
              </ListItem>
            </List>
          </Collapse>
          
          {/* Segments - Only for Marketing/Admin roles */}
          {isMarketing && (
            <ListItem 
              button 
              selected={location.pathname.startsWith('/segments')} 
              onClick={() => navigate('/segments')}
            >
              <ListItemIcon>
                <Group />
              </ListItemIcon>
              <ListItemText primary="Customer Segments" />
            </ListItem>
          )}
          
          {/* Transactions */}
          <ListItem 
            button 
            selected={location.pathname.startsWith('/transactions')} 
            onClick={() => navigate('/transactions')}
          >
            <ListItemIcon>
              <Receipt />
            </ListItemIcon>
            <ListItemText primary="Transactions" />
          </ListItem>
        </List>
        
        <Divider sx={{ mt: 2, mb: 2 }} />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            User Role: {user ? user.role : 'Loading...'}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;