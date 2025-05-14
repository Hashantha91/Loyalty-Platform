import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Context
import { AuthContext } from './context/AuthContext';
import { AlertContext } from './context/AlertContext';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Alert from './components/common/Alert';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import ChangePasswordPage from './pages/Auth/ChangePasswordPage';

// Dashboard
import DashboardPage from './pages/Dashboard/DashboardPage';

// Customer Pages
import CustomersPage from './pages/Customers/CustomersPage';
import CustomerDetailsPage from './pages/Customers/CustomerDetailsPage';
import AddCustomerPage from './pages/Customers/AddCustomerPage';

// Loyalty Pages
import PointsStructurePage from './pages/Loyalty/PointsStructurePage';
import TiersPage from './pages/Loyalty/TiersPage';
import AddTierPage from './pages/Loyalty/AddTierPage';
import EditTierPage from './pages/Loyalty/EditTierPage';
import RewardsPage from './pages/Loyalty/RewardsPage';
import AddRewardPage from './pages/Loyalty/AddRewardPage';
import EditRewardPage from './pages/Loyalty/EditRewardPage';

// Segments Pages
import SegmentsPage from './pages/Segments/SegmentsPage';
import AddSegmentPage from './pages/Segments/AddSegmentPage';
import EditSegmentPage from './pages/Segments/EditSegmentPage';
import SegmentDetailsPage from './pages/Segments/SegmentDetailsPage';

// Transactions Pages
import TransactionsPage from './pages/Transactions/TransactionsPage';
import TransactionDetailsPage from './pages/Transactions/TransactionDetailsPage';

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { alert } = useContext(AlertContext);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <Sidebar />}
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: isAuthenticated ? 30 : 0 }}>
        {alert.show && <Alert />}
        
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />
          
          {/* Dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Customer Routes */}
          <Route path="/customers" element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/customers/add" element={
            <ProtectedRoute>
              <AddCustomerPage />
            </ProtectedRoute>
          } />
          
          <Route path="/customers/:id" element={
            <ProtectedRoute>
              <CustomerDetailsPage />
            </ProtectedRoute>
          } />
          
          {/* Loyalty Routes */}
          <Route path="/loyalty/points" element={
            <ProtectedRoute>
              <PointsStructurePage />
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty/tiers" element={
            <ProtectedRoute>
              <TiersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty/tiers/add" element={
            <ProtectedRoute>
              <AddTierPage />
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty/tiers/:id" element={
            <ProtectedRoute>
              <EditTierPage />
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty/rewards" element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty/rewards/add" element={
            <ProtectedRoute>
              <AddRewardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/loyalty/rewards/:id" element={
            <ProtectedRoute>
              <EditRewardPage />
            </ProtectedRoute>
          } />
          
          {/* Segments Routes */}
          <Route path="/segments" element={
            <ProtectedRoute>
              <SegmentsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/segments/add" element={
            <ProtectedRoute>
              <AddSegmentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/segments/:id/edit" element={
            <ProtectedRoute>
              <EditSegmentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/segments/:id" element={
            <ProtectedRoute>
              <SegmentDetailsPage />
            </ProtectedRoute>
          } />
          
          {/* Transactions Routes */}
          <Route path="/transactions" element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/transactions/:id" element={
            <ProtectedRoute>
              <TransactionDetailsPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;