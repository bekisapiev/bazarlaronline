import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Детали товара {id}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Страница в разработке...
        </Typography>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
