import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Fab,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Storefront as StorefrontIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Don't show on desktop
  if (!isMobile) {
    return null;
  }

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/sellers')) return 1;
    if (path.startsWith('/orders')) return 3;
    if (path.startsWith('/profile')) return 4;
    return -1;
  };

  const handleNavigation = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/sellers');
        break;
      case 3:
        navigate('/orders');
        break;
      case 4:
        navigate('/profile');
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' },
      }}
      elevation={3}
    >
      <Box sx={{ position: 'relative', height: 70 }}>
        {/* Add button in center */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
          }}
          onClick={() => navigate('/add')}
        >
          <AddIcon />
        </Fab>

        {/* Bottom navigation */}
        <BottomNavigation
          value={getCurrentValue()}
          onChange={handleNavigation}
          showLabels
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
            },
          }}
        >
          <BottomNavigationAction
            label="Главная"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Продавцы"
            icon={<StorefrontIcon />}
          />
          {/* Empty space for the FAB */}
          <BottomNavigationAction
            sx={{ visibility: 'hidden', pointerEvents: 'none' }}
            label=""
            icon={<div />}
          />
          <BottomNavigationAction
            label="Заказы"
            icon={<ReceiptIcon />}
          />
          <BottomNavigationAction
            label="Профиль"
            icon={<PersonIcon />}
          />
        </BottomNavigation>
      </Box>
    </Paper>
  );
};

export default MobileBottomNav;
