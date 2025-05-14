import React from 'react';
import { Container } from '@mui/material';
import CustomerDetails from '../../components/customers/CustomerDetails';

const CustomerDetailsPage = () => {
  return (
    <Container maxWidth="lg">
      <CustomerDetails />
    </Container>
  );
};

export default CustomerDetailsPage;