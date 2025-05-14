import React from 'react';
import { Container } from '@mui/material';
import RewardsList from '../../components/loyalty/RewardsList';

const RewardsPage = () => {
  return (
    <Container maxWidth="lg">
      <RewardsList />
    </Container>
  );
};

export default RewardsPage;