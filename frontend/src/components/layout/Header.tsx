import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { notificationsAPI } from '../../services/api';
import { setUnreadCount } from '../../store/slices/notificationsSlice';
import { logout } from '../../store/slices/authSlice';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { favoriteIds } = useSelector((state: RootState) => state.favorites);

  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      dispatch(setUnreadCount(response.data.unread_count));
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
    }
  }, [isAuthenticated, loadUnreadCount]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchor(null);
  };

  const handleProfileNavigation = (path: string) => {
    navigate(path);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Clear Redux auth state
    dispatch(logout());

    // Close menu and navigate to login
    handleProfileMenuClose();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.tariff && user.tariff !== 'free';

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                cursor: 'pointer',
              }}
            >
              Bazarlar Online
            </Typography>
          </Link>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
            <Button color="inherit" onClick={() => navigate('/sellers')}>
              Продавцы
            </Button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/notifications')}
                  aria-label="notifications"
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                {/* Favorites */}
                <IconButton
                  color="inherit"
                  onClick={() => navigate('/favorites')}
                  aria-label="favorites"
                >
                  <Badge badgeContent={favoriteIds.size} color="primary">
                    <FavoriteIcon />
                  </Badge>
                </IconButton>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/add')}
                  sx={{ mx: 1 }}
                >
                  Добавить
                </Button>

                {/* Profile Menu */}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  aria-label="account"
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.full_name?.[0] || <AccountIcon />}
                  </Avatar>
                </IconButton>

                <Menu
                  id="profile-menu"
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => handleProfileNavigation('/profile')}>
                    <ListItemIcon>
                      <AccountIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Профиль</ListItemText>
                  </MenuItem>

                  {isSeller && (
                    <MenuItem onClick={() => handleProfileNavigation('/seller/dashboard')}>
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Мой магазин</ListItemText>
                    </MenuItem>
                  )}

                  {isAdmin && (
                    <MenuItem onClick={() => handleProfileNavigation('/admin')}>
                      <ListItemIcon>
                        <AdminIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Админ панель</ListItemText>
                    </MenuItem>
                  )}

                  <MenuItem onClick={() => handleProfileNavigation('/settings')}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Настройки</ListItemText>
                  </MenuItem>

                  <Divider />

                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Выйти</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
