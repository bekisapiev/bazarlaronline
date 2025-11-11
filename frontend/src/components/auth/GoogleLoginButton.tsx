import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setUser } from '../../store/slices/authSlice';

declare global {
  interface Window {
    google: any;
  }
}

const GoogleLoginButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const token = response.credential;

      // Send token to backend
      const result = await authAPI.googleAuth(token);

      // Save tokens
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);

      // Get user info
      const userResponse = await authAPI.getCurrentUser();
      dispatch(setUser(userResponse.data));

      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Ошибка входа. Попробуйте еще раз.');
    }
  };

  const handleGoogleLogin = () => {
    window.google.accounts.id.prompt();
  };

  return (
    <Button
      variant="outlined"
      startIcon={<Google />}
      onClick={handleGoogleLogin}
      fullWidth
      sx={{
        borderColor: '#4285f4',
        color: '#4285f4',
        '&:hover': {
          borderColor: '#357ae8',
          backgroundColor: 'rgba(66, 133, 244, 0.04)',
        },
      }}
    >
      Войти через Google
    </Button>
  );
};

export default GoogleLoginButton;
