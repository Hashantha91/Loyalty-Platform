import React from 'react';
import { Container } from '@mui/material';
import TransactionDetails from '../../components/transactions/TransactionDetails';

const TransactionDetailsPage = () => {
  return (
    <Container maxWidth="lg">
      <TransactionDetails />
    </Container>
  );
};

export default TransactionDetailsPage;