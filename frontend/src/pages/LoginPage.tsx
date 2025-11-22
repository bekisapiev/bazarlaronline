import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Divider, Tabs, Tab } from '@mui/material';
import { Google, Telegram, PhoneAndroid, Email } from '@mui/icons-material';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import TelegramLoginWidget from '../components/auth/TelegramLoginWidget';
import TelegramCodeAuth from '../components/auth/TelegramCodeAuth';
import EmailAuth from '../components/auth/EmailAuth';

const LoginPage: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'widget' | 'code' | 'email'>('email');

  const telegramBotUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'bazarlar_online_bot';

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

          {/* Google Login */}
          <GoogleLoginButton />

          {/* Divider */}
          <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
              или
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Auth Methods Tabs */}
          <Box sx={{ mb: 2 }}>
            <Tabs
              value={authMethod}
              onChange={(_, newValue) => setAuthMethod(newValue)}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 48,
                },
              }}
            >
              <Tab
                icon={<Email />}
                iconPosition="start"
                label="Email"
                value="email"
                sx={{ textTransform: 'none' }}
              />
              <Tab
                icon={<Telegram />}
                iconPosition="start"
                label="Telegram кнопка"
                value="widget"
                sx={{ textTransform: 'none' }}
              />
              <Tab
                icon={<PhoneAndroid />}
                iconPosition="start"
                label="Код в Telegram"
                value="code"
                sx={{ textTransform: 'none' }}
              />
            </Tabs>
          </Box>

          {/* Email Auth */}
          {authMethod === 'email' && (
            <Box sx={{ mt: 3 }}>
              <EmailAuth />
            </Box>
          )}

          {/* Telegram Login Widget */}
          {authMethod === 'widget' && (
            <Box sx={{ mt: 3 }}>
              <TelegramLoginWidget
                botUsername={telegramBotUsername}
                buttonSize="large"
                requestAccess="write"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                Нажмите кнопку выше, чтобы войти через Telegram
              </Typography>
            </Box>
          )}

          {/* Telegram Code Auth */}
          {authMethod === 'code' && (
            <Box sx={{ mt: 3 }}>
              <TelegramCodeAuth />
            </Box>
          )}

          {/* Terms */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
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
