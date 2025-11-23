import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Store,
  Security,
  Speed,
  Support,
  TrendingUp,
  Verified,
  NavigateNext,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Store />,
      title: 'Широкий выбор',
      description: 'Тысячи товаров и услуг от проверенных продавцов',
    },
    {
      icon: <Security />,
      title: 'Безопасность',
      description: 'Защита данных и безопасные платежи',
    },
    {
      icon: <Speed />,
      title: 'Быстрый поиск',
      description: 'Удобный поиск и фильтрация товаров',
    },
    {
      icon: <Support />,
      title: 'Поддержка 24/7',
      description: 'Круглосуточная помощь пользователям',
    },
    {
      icon: <TrendingUp />,
      title: 'Для бизнеса',
      description: 'Инструменты для роста продаж',
    },
    {
      icon: <Verified />,
      title: 'Проверенные продавцы',
      description: 'Все продавцы проходят модерацию',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Активных пользователей' },
    { value: '50,000+', label: 'Товаров и услуг' },
    { value: '1,000+', label: 'Проверенных продавцов' },
    { value: '99%', label: 'Довольных клиентов' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <MuiLink
          component={Link}
          to="/"
          underline="hover"
          color="inherit"
        >
          Главная
        </MuiLink>
        <Typography color="text.primary">О нас</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          О Bazarlar Online
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 800, opacity: 0.95 }}>
          Современная онлайн-платформа для покупки и продажи товаров и услуг в Кыргызстане
        </Typography>
      </Paper>

      {/* Mission Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Наша миссия
        </Typography>
        <Paper sx={{ p: 4 }}>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Мы создали Bazarlar Online, чтобы объединить покупателей и продавцов на единой удобной платформе.
            Наша цель — сделать процесс покупки и продажи максимально простым, безопасным и выгодным для всех участников.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Мы верим в развитие местного бизнеса и предоставляем современные инструменты для роста и процветания
            предпринимателей Кыргызстана.
          </Typography>
        </Paper>
      </Box>

      {/* Stats Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Bazarlar Online в цифрах
        </Typography>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ py: 4 }}>
                  <Typography variant="h3" color="primary" fontWeight={700} gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Почему выбирают нас
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Values Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Наши ценности
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'primary.50' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                Доверие
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Мы строим отношения на основе прозрачности и честности, обеспечивая безопасность каждой сделки.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'success.50' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="success.dark">
                Инновации
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Мы постоянно совершенствуем платформу, внедряя новые технологии и улучшая пользовательский опыт.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'warning.50' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="warning.dark">
                Поддержка
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Мы всегда готовы помочь нашим пользователям решить любые вопросы и преодолеть трудности.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Contact Section */}
      <Paper sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Свяжитесь с нами
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Email:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              support@bazarlaronline.kg
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Телефон:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              +996 (XXX) XX-XX-XX
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Адрес:</strong>
            </Typography>
            <Typography variant="body1">
              г. Бишкек, Кыргызстан
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AboutPage;
