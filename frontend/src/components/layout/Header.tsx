import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import SearchBar from '../common/SearchBar';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

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

          {/* Search Bar */}
          <Box sx={{ flex: 1, mx: 4, maxWidth: 600 }}>
            <SearchBar />
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" onClick={() => navigate('/sellers')}>
              Продавцы
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/add')}
                >
                  Добавить объявление
                </Button>
                <Button color="inherit" onClick={() => navigate('/profile')}>
                  Профиль
                </Button>
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
