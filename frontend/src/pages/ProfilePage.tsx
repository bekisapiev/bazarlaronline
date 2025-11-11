import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Профиль
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Страница в разработке...
        </Typography>
      </Box>
    </Container>
  );
};

export default ProfilePage;
