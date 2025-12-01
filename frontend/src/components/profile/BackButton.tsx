import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Box, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface BackButtonProps {
  title: string;
  to?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ title, to = '/profile' }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <IconButton
        onClick={() => navigate(to)}
        sx={{
          mr: 1,
          bgcolor: 'grey.100',
          '&:hover': { bgcolor: 'grey.200' },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
    </Box>
  );
};

export default BackButton;
