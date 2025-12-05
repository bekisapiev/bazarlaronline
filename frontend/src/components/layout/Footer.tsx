import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: '#F5F5F5',
        borderTop: '1px solid #E0E0E0',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Bazarlar Online
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Торговая площадка Кыргызстана
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Покупателям
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="text.secondary" underline="hover">
                Товары
              </Link>
              <Link href="/sellers" color="text.secondary" underline="hover">
                Продавцы
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Продавцам
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/add" color="text.secondary" underline="hover">
                Добавить объявление
              </Link>
              <Link href="/tariffs" color="text.secondary" underline="hover">
                Тарифы
              </Link>
              <Link href="/partner" color="text.secondary" underline="hover">
                Партнерская программа
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Информация
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/how-it-works" color="text.secondary" underline="hover">
                Как это работает?
              </Link>
              <Link href="/about" color="text.secondary" underline="hover">
                О нас
              </Link>
              <Link href="/privacy" color="text.secondary" underline="hover">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" color="text.secondary" underline="hover">
                Пользовательское соглашение
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E0E0E0' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Bazarlar Online. Все права защищены.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
