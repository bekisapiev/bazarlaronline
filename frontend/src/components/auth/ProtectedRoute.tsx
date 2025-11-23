import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setUser } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if tokens exist
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!accessToken || !refreshToken) {
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      // If tokens exist but user is not authenticated in Redux, try to fetch user
      if (!isAuthenticated) {
        try {
          const response = await authAPI.getCurrentUser();
          dispatch(setUser(response.data));
        } catch (error) {
          // If fetch fails, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }

      setLoading(false);
      setAuthChecked(true);
    };

    checkAuth();
  }, [dispatch, isAuthenticated]);

  if (loading || !authChecked) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
