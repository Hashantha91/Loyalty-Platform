import React from 'react';
import { Container } from '@mui/material';
import SegmentsList from '../../components/segments/SegmentsList';

const SegmentsPage = () => {
  return (
    <Container maxWidth="lg">
      <SegmentsList />
    </Container>
  );
};

export default SegmentsPage;