import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Telegram, Send, Lock } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setUser } from '../../store/slices/authSlice';

const TelegramCodeAuth: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [telegramId, setTelegramId] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expiresIn, setExpiresIn] = useState<number>(10);

  const handleRequestCode = async () => {
    if (!telegramId.trim() || !phone.trim()) {
      setError('Заполните все поля');
      return;
    }

    // Validate phone format (0XXX XX XX XX or 0XXXXXXXXX)
    const phoneRegex = /^0\d{3}\s?\d{2}\s?\d{2}\s?\d{2}$/;
    if (!phoneRegex.test(phone)) {
      setError('Неверный формат телефона. Используйте формат: 0555 00 00 00');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.telegramRequestCode(telegramId, phone);
      setSuccess(response.data.message);
      setExpiresIn(response.data.expires_in_minutes);
      setStep('code');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Ошибка отправки кода';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Введите код верификации');
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Код должен состоять из 6 цифр');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authAPI.telegramVerifyCode({
        telegram_id: telegramId,
        phone: phone,
        code: code,
      });

      // Save tokens
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);

      // Get user info
      const userResponse = await authAPI.getCurrentUser();
      dispatch(setUser(userResponse.data));

      // Redirect to home
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Неверный код верификации';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setCode('');
    setError('');
    setSuccess('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
      {step === 'phone' ? (
        // Step 1: Enter Telegram ID and Phone
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Telegram sx={{ mr: 1, color: '#0088cc' }} />
            <Typography variant="h6">Вход через Telegram</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Мы отправим код верификации в ваш Telegram
          </Typography>

          <TextField
            fullWidth
            label="Telegram ID"
            placeholder="Ваш Telegram ID"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleRequestCode)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Telegram color="action" />
                </InputAdornment>
              ),
            }}
            helperText={
              <span>
                Узнать свой ID: откройте бота{' '}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0088cc' }}
                >
                  @userinfobot
                </a>
              </span>
            }
          />

          <TextField
            fullWidth
            label="Номер телефона"
            placeholder="0555 00 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleRequestCode)}
            sx={{ mb: 2 }}
            helperText="Формат: 0555 00 00 00"
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleRequestCode}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            sx={{
              backgroundColor: '#0088cc',
              '&:hover': {
                backgroundColor: '#006699',
              },
            }}
          >
            {loading ? 'Отправка...' : 'Получить код'}
          </Button>
        </Box>
      ) : (
        // Step 2: Enter Verification Code
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Lock sx={{ mr: 1, color: '#0088cc' }} />
            <Typography variant="h6">Введите код</Typography>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Код отправлен в Telegram. Код действителен {expiresIn} минут.
          </Typography>

          <TextField
            fullWidth
            label="Код верификации"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={(e) => handleKeyPress(e, handleVerifyCode)}
            sx={{ mb: 2 }}
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' },
            }}
            autoFocus
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            startIcon={loading ? <CircularProgress size={20} /> : <Telegram />}
            sx={{
              mb: 1,
              backgroundColor: '#0088cc',
              '&:hover': {
                backgroundColor: '#006699',
              },
            }}
          >
            {loading ? 'Проверка...' : 'Войти'}
          </Button>

          <Button fullWidth variant="text" onClick={handleBack} disabled={loading}>
            Назад
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default TelegramCodeAuth;
