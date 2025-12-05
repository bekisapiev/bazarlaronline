import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ShoppingBag,
  People,
  TrendingUp,
  Verified,
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          О Bazarlar Online
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
          Современная торговая площадка Кыргызстана для покупателей,
          продавцов и партнеров
        </Typography>
      </Box>

      {/* Mission */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Наша миссия
        </Typography>
        <Typography variant="body1" paragraph>
          Bazarlar Online создан для того, чтобы сделать онлайн-торговлю в Кыргызстане доступной,
          удобной и выгодной для всех участников. Мы объединяем покупателей, продавцов и партнеров
          в единую экосистему, где каждый может найти свою выгоду.
        </Typography>
        <Typography variant="body1">
          Мы верим, что честные и прозрачные бизнес-отношения, инновационные технологии и
          внимание к деталям помогают создавать лучший опыт для всех пользователей нашей платформы.
        </Typography>
      </Paper>

      {/* Key Features */}
      <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        Наши преимущества
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <ShoppingBag sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Товары и услуги
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Размещайте товары и услуги, принимайте заказы и записи на услуги
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Продвижение
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Эффективная система продвижения товаров с оплатой по просмотрам
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <People sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Реферальная программа
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Зарабатывайте 5% с пополнений рефералов и комиссий с продаж
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <Verified sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Безопасность
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Защита данных и прозрачные условия для всех пользователей
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Values */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: 'primary.50' }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Наши ценности
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Прозрачность
            </Typography>
            <Typography variant="body2">
              Все условия, комиссии и правила четко описаны и доступны всем пользователям
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Инновации
            </Typography>
            <Typography variant="body2">
              Мы постоянно развиваем платформу, добавляя новые функции и улучшая существующие
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Поддержка
            </Typography>
            <Typography variant="body2">
              Мы всегда готовы помочь нашим пользователям решить любые вопросы
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Contact */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Свяжитесь с нами
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" paragraph>
          <strong>Email:</strong> support@bazarlaronline.kg
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Телефон:</strong> +996 XXX XXX XXX
        </Typography>
        <Typography variant="body1">
          <strong>Адрес:</strong> г. Бишкек, Кыргызстан
        </Typography>
      </Paper>
    </Container>
  );
};

export default AboutPage;
