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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Storefront as StorefrontIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  Handshake as HandshakeIcon,
  AccountBalanceWallet as WalletIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { notificationsAPI } from '../../services/api';
import { setUnreadCount } from '../../store/slices/notificationsSlice';
import { logout } from '../../store/slices/authSlice';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { favoriteIds } = useSelector((state: RootState) => state.favorites);

  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setDrawerOpen(false);
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.tariff && user.tariff !== 'free';

  return (
    <>
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
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Bazarlar Online
              </Typography>
            </Link>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center', ml: 'auto' }}>
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
                  <MenuItem onClick={() => handleProfileNavigation('/my-profile')}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Мой профиль</ListItemText>
                  </MenuItem>

                  <MenuItem onClick={() => handleProfileNavigation('/my-products-services')}>
                    <ListItemIcon>
                      <StorefrontIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Мои товары и услуги</ListItemText>
                  </MenuItem>

                  <MenuItem onClick={() => handleProfileNavigation('/my-orders')}>
                    <ListItemIcon>
                      <ShoppingBagIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Мои заказы</ListItemText>
                  </MenuItem>

                  <MenuItem onClick={() => handleProfileNavigation('/me-orders')}>
                    <ListItemIcon>
                      <ReceiptIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Мне заказали</ListItemText>
                  </MenuItem>

                  <MenuItem onClick={() => handleProfileNavigation('/partners-products')}>
                    <ListItemIcon>
                      <HandshakeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Партнерские товары и услуги</ListItemText>
                  </MenuItem>

                  <MenuItem onClick={() => handleProfileNavigation('/my-wallet')}>
                    <ListItemIcon>
                      <WalletIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Мой кошелек</ListItemText>
                  </MenuItem>

                  <Divider />

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

          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>
    </AppBar>

    {/* Mobile Drawer Menu */}
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={handleDrawerToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Меню
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
      </Box>

      <List>
        {/* Main Navigation */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleDrawerNavigation('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Главная" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => handleDrawerNavigation('/sellers')}>
            <ListItemIcon>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText primary="Продавцы" />
          </ListItemButton>
        </ListItem>

        {isAuthenticated ? (
          <>
            <Divider sx={{ my: 1 }} />

            {/* Quick Actions */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/add')}>
                <ListItemIcon>
                  <AddIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Добавить товар"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/notifications')}>
                <ListItemIcon>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Уведомления" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/favorites')}>
                <ListItemIcon>
                  <Badge badgeContent={favoriteIds.size} color="primary">
                    <FavoriteIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Избранное" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Profile Section */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/my-profile')}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Мой профиль" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/my-products-services')}>
                <ListItemIcon>
                  <StorefrontIcon />
                </ListItemIcon>
                <ListItemText primary="Мои товары и услуги" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/my-orders')}>
                <ListItemIcon>
                  <ShoppingBagIcon />
                </ListItemIcon>
                <ListItemText primary="Мои заказы" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/me-orders')}>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary="Мне заказали" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/partners-products')}>
                <ListItemIcon>
                  <HandshakeIcon />
                </ListItemIcon>
                <ListItemText primary="Партнерские товары" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/my-wallet')}>
                <ListItemIcon>
                  <WalletIcon />
                </ListItemIcon>
                <ListItemText primary="Мой кошелек" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Seller Dashboard */}
            {isSeller && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleDrawerNavigation('/seller/dashboard')}>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Мой магазин" />
                </ListItemButton>
              </ListItem>
            )}

            {/* Admin Panel */}
            {isAdmin && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleDrawerNavigation('/admin')}>
                  <ListItemIcon>
                    <AdminIcon />
                  </ListItemIcon>
                  <ListItemText primary="Админ панель" />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/settings')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Настройки" />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Logout */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Выйти"
                  primaryTypographyProps={{ color: 'error.main' }}
                />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleDrawerNavigation('/login')}>
                <ListItemIcon>
                  <LoginIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Войти"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {/* User Info at Bottom */}
      {isAuthenticated && user && (
        <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40 }}>
              {user.full_name?.[0] || <AccountIcon />}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {user.full_name || 'Пользователь'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  </>
  );
};

export default Header;
