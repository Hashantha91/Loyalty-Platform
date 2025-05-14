import React from 'react';
import { Container } from '@mui/material';
import TiersList from '../../components/loyalty/TiersList';

const TiersPage = () => {
  return (
    <Container maxWidth="lg">
      <TiersList />
    </Container>
  );
};

export default TiersPage;