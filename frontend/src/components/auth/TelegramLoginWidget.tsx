import React, { useEffect, useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { setUser } from '../../store/slices/authSlice';

interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

interface TelegramLoginWidgetProps {
  botUsername: string;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: 'write';
  usePic?: boolean;
  lang?: string;
}

const TelegramLoginWidget: React.FC<TelegramLoginWidgetProps> = ({
  botUsername,
  buttonSize = 'large',
  cornerRadius,
  requestAccess,
  usePic = true,
  lang = 'ru',
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const handleTelegramResponse = useCallback(async (user: TelegramUser) => {
    try {
      console.log('Telegram auth response:', user);

      // Send data to backend
      const result = await authAPI.telegramWidget(user);

      // Save tokens
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);

      // Get user info
      const userResponse = await authAPI.getCurrentUser();
      dispatch(setUser(userResponse.data));

      // Redirect to home
      navigate('/');
    } catch (error: any) {
      console.error('Telegram login failed:', error);
      const errorMessage = error.response?.data?.detail || 'Ошибка входа через Telegram';
      alert(errorMessage);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    // Set global callback
    window.onTelegramAuth = handleTelegramResponse;

    // Create and append script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', requestAccess || 'write');
    script.setAttribute('data-lang', lang);

    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString());
    }
    if (usePic) {
      script.setAttribute('data-userpic', 'true');
    }

    scriptRef.current = script;
    containerRef.current?.appendChild(script);

    return () => {
      // Cleanup
      if (scriptRef.current && containerRef.current?.contains(scriptRef.current)) {
        containerRef.current.removeChild(scriptRef.current);
      }
      delete window.onTelegramAuth;
    };
  }, [botUsername, buttonSize, cornerRadius, requestAccess, usePic, lang, handleTelegramResponse]);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40px',
      }}
    />
  );
};

export default TelegramLoginWidget;
