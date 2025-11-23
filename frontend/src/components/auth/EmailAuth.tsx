import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setUser } from '../../store/slices/authSlice';
import { handleReferralCode, clearReferralCodeCookie } from '../../utils/referral';

const EmailAuth: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [refCode, setRefCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load referral code from cookies on component mount
    const code = handleReferralCode();
    if (code) {
      setRefCode(code);
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }

    if (!validateEmail(email)) {
      setError('Неверный формат email');
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.login(email, password);

      // Save tokens
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);

      // Get user info
      const userResponse = await authAPI.getCurrentUser();
      dispatch(setUser(userResponse.data));

      // Redirect to the page user was trying to access, or home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Ошибка входа';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Заполните обязательные поля');
      return;
    }

    if (!validateEmail(email)) {
      setError('Неверный формат email');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.register(email, password, fullName || undefined, refCode || undefined);

      // Save tokens
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);

      // Get user info
      const userResponse = await authAPI.getCurrentUser();
      dispatch(setUser(userResponse.data));

      // Clear referral cookie after successful registration
      clearReferralCodeCookie();

      // Redirect to the page user was trying to access, or home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Ошибка регистрации';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleModeChange = (_: React.SyntheticEvent, newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
  };

  return (
    <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={mode}
          onChange={handleModeChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab label="Вход" value="login" sx={{ textTransform: 'none', fontSize: '1rem' }} />
          <Tab label="Регистрация" value="register" sx={{ textTransform: 'none', fontSize: '1rem' }} />
        </Tabs>
      </Box>

      {mode === 'register' && (
        <TextField
          fullWidth
          label="Полное имя (необязательно)"
          placeholder="Иван Иванов"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="action" />
              </InputAdornment>
            ),
          }}
        />
      )}

      <TextField
        fullWidth
        label="Email"
        type="email"
        placeholder="example@mail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Введите пароль'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <Email />}
        sx={{
          backgroundColor: '#FF6B35',
          '&:hover': {
            backgroundColor: '#E55A2B',
          },
        }}
      >
        {loading
          ? mode === 'login'
            ? 'Вход...'
            : 'Регистрация...'
          : mode === 'login'
          ? 'Войти'
          : 'Зарегистрироваться'}
      </Button>

      {mode === 'register' && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          После регистрации вы будете автоматически авторизованы
        </Typography>
      )}
    </Paper>
  );
};

export default EmailAuth;
