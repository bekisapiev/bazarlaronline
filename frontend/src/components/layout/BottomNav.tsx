import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Fab,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Storefront as StorefrontIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Don't show on desktop
  if (!isMobile) {
    return null;
  }

  // Determine current active tab based on pathname
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/sellers') || path.startsWith('/users')) return 1;
    if (path.startsWith('/favorites')) return 3;
    if (path.startsWith('/my-')) return 4;
    return 0;
  };

  const handleNavigation = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/sellers');
        break;
      case 3:
        navigate('/favorites');
        break;
      case 4:
        navigate('/my-profile');
        break;
    }
  };

  const handleAddClick = () => {
    if (isAuthenticated) {
      navigate('/products/add');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <Box sx={{ height: 70 }} />

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          borderTop: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        }}
        elevation={3}
      >
        <BottomNavigation
          value={getCurrentValue()}
          onChange={handleNavigation}
          showLabels
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                marginTop: '4px',
              },
            },
          }}
        >
          <BottomNavigationAction
            label="Главная"
            icon={<HomeIcon />}
            sx={{ maxWidth: '20%' }}
          />
          <BottomNavigationAction
            label="Продавцы"
            icon={<StorefrontIcon />}
            sx={{ maxWidth: '20%' }}
          />
          {/* Empty space for FAB */}
          <BottomNavigationAction
            label=""
            icon={<Box sx={{ width: 56, height: 56 }} />}
            disabled
            sx={{
              maxWidth: '20%',
              cursor: 'default',
              '&.Mui-disabled': {
                opacity: 1,
              },
            }}
          />
          <BottomNavigationAction
            label="Избранное"
            icon={<FavoriteIcon />}
            sx={{ maxWidth: '20%' }}
          />
          <BottomNavigationAction
            label="Профиль"
            icon={<PersonIcon />}
            sx={{ maxWidth: '20%' }}
          />
        </BottomNavigation>

        {/* Floating Action Button - Add Product */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddClick}
          sx={{
            position: 'absolute',
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 64,
            height: 64,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              transform: 'translateX(-50%) scale(1.05)',
            },
            transition: 'all 0.3s ease',
            zIndex: 1101,
          }}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Paper>
    </>
  );
};

export default BottomNav;
