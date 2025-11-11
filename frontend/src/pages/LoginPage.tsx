import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Вход в Bazarlar Online
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Войдите, чтобы начать покупать и продавать
            </Typography>
          </Box>

          <GoogleLoginButton />

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Входя на сайт, вы соглашаетесь с{' '}
              <a href="/terms" style={{ color: '#FF6B35' }}>
                условиями использования
              </a>{' '}
              и{' '}
              <a href="/privacy" style={{ color: '#FF6B35' }}>
                политикой конфиденциальности
              </a>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
