import React from 'react';
import { Container, Box, Typography, Paper, Divider, Alert } from '@mui/material';
import { Telegram, InfoOutlined } from '@mui/icons-material';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import TelegramLoginWidget from '../components/auth/TelegramLoginWidget';

const LoginPage: React.FC = () => {
  const telegramBotUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;
  const isTelegramConfigured = telegramBotUsername &&
    telegramBotUsername !== 'your_bot_username' &&
    telegramBotUsername !== 'bazarlar_online_bot';

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

          {/* Google Login - Primary Method */}
          <GoogleLoginButton />

          {/* Divider */}
          <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
              или
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>

          {/* Telegram Login */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Telegram sx={{ mr: 1, color: '#0088cc', fontSize: 28 }} />
              <Typography variant="h6" color="#0088cc">
                Вход через Telegram
              </Typography>
            </Box>

            {isTelegramConfigured ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                  Один клик - и вы уже на платформе. Никаких паролей и длинных форм!
                </Typography>
                <TelegramLoginWidget
                  botUsername={telegramBotUsername!}
                  buttonSize="large"
                  requestAccess="write"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                  Нажмите кнопку выше для входа
                </Typography>
              </>
            ) : (
              <Alert severity="info" icon={<InfoOutlined />} sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Авторизация через Telegram временно недоступна.
                  <br />
                  Используйте вход через Google.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Terms */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Входя на сайт, вы соглашаетесь с{' '}
              <a href="/terms" style={{ color: '#FF6B35', textDecoration: 'none' }}>
                условиями использования
              </a>{' '}
              и{' '}
              <a href="/privacy" style={{ color: '#FF6B35', textDecoration: 'none' }}>
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
