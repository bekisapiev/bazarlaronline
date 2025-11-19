import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
} from '@mui/material';
import {
  Store as StoreIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Активных продавцов', value: '5,000+', icon: <StoreIcon sx={{ fontSize: 40 }} /> },
    { label: 'Пользователей', value: '50,000+', icon: <PeopleIcon sx={{ fontSize: 40 }} /> },
    { label: 'Сделок в месяц', value: '20,000+', icon: <TrendingUpIcon sx={{ fontSize: 40 }} /> },
    { label: 'Безопасных транзакций', value: '100%', icon: <SecurityIcon sx={{ fontSize: 40 }} /> },
  ];

  const values = [
    {
      title: 'Доверие',
      description:
        'Мы проверяем каждого продавца и обеспечиваем безопасность всех транзакций на платформе.',
    },
    {
      title: 'Прозрачность',
      description:
        'Открытые отзывы, рейтинги и полная информация о продавцах помогают принимать правильные решения.',
    },
    {
      title: 'Инновации',
      description:
        'Постоянно развиваем платформу, добавляя новые возможности для удобства покупателей и продавцов.',
    },
    {
      title: 'Поддержка',
      description:
        'Наша команда всегда готова помочь решить любые вопросы и проблемы пользователей.',
    },
  ];

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">О нас</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8, mt: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          О Bazarlar Online
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
        >
          Крупнейшая онлайн-платформа для торговли в Кыргызстане
        </Typography>
      </Box>

      {/* Mission */}
      <Paper sx={{ p: 4, mb: 6, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} align="center">
          Наша миссия
        </Typography>
        <Typography variant="h6" align="center" sx={{ maxWidth: 900, mx: 'auto' }}>
          Сделать торговлю в Кыргызстане простой, удобной и безопасной, объединив продавцов
          с рынков и бутиков с миллионами покупателей по всей стране.
        </Typography>
      </Paper>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                textAlign: 'center',
                p: 3,
                height: '100%',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>{stat.icon}</Box>
              <Typography variant="h4" gutterBottom fontWeight={700}>
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Story */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center">
          Наша история
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              Bazarlar Online была основана в 2024 году с целью цифровизации традиционной
              торговли в Кыргызстане. Мы заметили, что многие талантливые продавцы с местных
              рынков не имеют доступа к широкой аудитории покупателей.
            </Typography>
            <Typography variant="body1" paragraph>
              Наша платформа стала мостом между традиционными рынками и современными
              технологиями. Сегодня тысячи продавцов успешно ведут свой бизнес онлайн,
              а покупатели получают доступ к огромному выбору товаров и услуг.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              Мы гордимся тем, что помогаем развиваться малому и среднему бизнесу в
              Кыргызстане. Каждый день на нашей платформе заключаются тысячи сделок,
              создаются новые рабочие места и растет экономика страны.
            </Typography>
            <Typography variant="body1" paragraph>
              Наша команда постоянно работает над улучшением платформы, добавляя новые
              функции и возможности. Мы слушаем наших пользователей и внедряем их идеи
              для создания лучшего опыта торговли в интернете.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Values */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 4 }}>
          Наши ценности
        </Typography>
        <Grid container spacing={3}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                    {value.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Contact CTA */}
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Хотите присоединиться к нам?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Начните продавать на Bazarlar Online уже сегодня или свяжитесь с нами для
          получения дополнительной информации.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Typography variant="body1">
            Email: <strong>support@bazarlar.kg</strong>
          </Typography>
          <Typography variant="body1">
            Телефон: <strong>+996 (555) 123-456</strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
