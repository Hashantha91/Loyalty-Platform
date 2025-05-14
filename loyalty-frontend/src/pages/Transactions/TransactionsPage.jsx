import React from 'react';
import { Container } from '@mui/material';
import TransactionsList from '../../components/transactions/TransactionsList';

const TransactionsPage = () => {
  return (
    <Container maxWidth="lg">
      <TransactionsList />
    </Container>
  );
};

export default TransactionsPage;