import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const SellersPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Продавцы
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Страница в разработке...
        </Typography>
      </Box>
    </Container>
  );
};

export default SellersPage;
