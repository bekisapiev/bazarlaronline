import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Store as StoreIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <StoreIcon sx={{ fontSize: 40 }} />,
    title: 'Тысячи продавцов',
    description: 'Более 5000 активных продавцов со всего Кыргызстана',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: 'Надежное сообщество',
    description: 'Проверенные пользователи и система отзывов',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    title: 'Рост продаж',
    description: 'Инструменты аналитики для увеличения продаж',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Безопасность',
    description: 'Защита данных и безопасные платежи',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    title: 'Быстрый старт',
    description: 'Начните продавать за 5 минут',
  },
  {
    icon: <SupportIcon sx={{ fontSize: 40 }} />,
    title: 'Поддержка 24/7',
    description: 'Всегда готовы помочь вам',
  },
];

const stats = [
  { value: '5000+', label: 'Активных продавцов' },
  { value: '50000+', label: 'Товаров и услуг' },
  { value: '100000+', label: 'Довольных покупателей' },
  { value: '99.9%', label: 'Успешных сделок' },
];

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          О Bazarlar Online
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Крупнейшая торговая площадка Кыргызстана для продажи товаров и услуг
        </Typography>
      </Box>

      {/* Mission */}
      <Paper elevation={2} sx={{ p: 4, mb: 6, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" gutterBottom fontWeight={600} align="center">
          Наша миссия
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 900, mx: 'auto' }}>
          Мы создаем удобную платформу для продавцов и покупателей в Кыргызстане, где каждый может
          легко продать свои товары или услуги, а покупатели могут найти все необходимое в одном месте.
          Bazarlar Online — это место, где оживают рынки, бутики, магазины и склады со всей страны.
        </Typography>
      </Paper>

      {/* Stats */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', py: 3 }}>
                <CardContent>
                  <Typography variant="h3" component="div" fontWeight={700} color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} align="center" sx={{ mb: 5 }}>
          Почему выбирают нас
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: '#FF6B35',
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* History */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Наша история
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Bazarlar Online была создана в 2024 году с целью объединить продавцов и покупателей
          в Кыргызстане на единой платформе. Мы начали с идеи сделать онлайн-торговлю доступной
          для всех — от небольших домашних бизнесов до крупных складов и магазинов.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          За короткое время мы выросли в крупнейшую торговую площадку страны, объединяющую
          более 5000 продавцов и десятки тысяч довольных покупателей.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Наша платформа поддерживает различные типы продавцов: рынки, бутики, магазины, офисы,
          домашние предприятия, мобильные точки и склады. Мы предоставляем инструменты для
          эффективного управления бизнесом, аналитику продаж и маркетинговые возможности.
        </Typography>
      </Paper>

      {/* Values */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Наши ценности
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Доверие
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Мы создаем безопасную и прозрачную среду для всех участников
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Инновации
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Постоянно развиваем платформу и добавляем новые возможности
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                Поддержка
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всегда рядом, чтобы помочь вашему бизнесу расти
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AboutPage;
