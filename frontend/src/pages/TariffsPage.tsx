import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface TariffFeature {
  text: string;
  included: boolean;
}

interface Tariff {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  features: TariffFeature[];
}

const tariffs: Tariff[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'Бесплатно',
    description: 'Для начинающих продавцов',
    icon: <StarIcon sx={{ fontSize: 40 }} />,
    color: '#9E9E9E',
    features: [
      { text: 'До 10 товаров/услуг', included: true },
      { text: 'Базовые категории', included: true },
      { text: '5 фотографий на товар', included: true },
      { text: 'Стандартная поддержка', included: true },
      { text: 'Реклама товаров', included: false },
      { text: 'Аналитика продаж', included: false },
      { text: 'Приоритетная поддержка', included: false },
      { text: 'Реферальная программа', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 990,
    period: 'в месяц',
    description: 'Для активных продавцов',
    icon: <RocketIcon sx={{ fontSize: 40 }} />,
    color: '#FF6B35',
    popular: true,
    features: [
      { text: 'До 100 товаров/услуг', included: true },
      { text: 'Все категории', included: true },
      { text: '20 фотографий на товар', included: true },
      { text: 'Приоритетная поддержка', included: true },
      { text: 'Реклама товаров (5 слотов)', included: true },
      { text: 'Расширенная аналитика', included: true },
      { text: 'Скидки на услуги', included: true },
      { text: 'Реферальная программа (5%)', included: true },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 4990,
    period: 'в месяц',
    description: 'Для крупного бизнеса',
    icon: <PremiumIcon sx={{ fontSize: 40 }} />,
    color: '#4CAF50',
    features: [
      { text: 'Неограниченно товаров', included: true },
      { text: 'Все категории + эксклюзивные', included: true },
      { text: 'Неограниченно фотографий', included: true },
      { text: 'VIP поддержка 24/7', included: true },
      { text: 'Реклама товаров (20 слотов)', included: true },
      { text: 'Полная аналитика + отчеты', included: true },
      { text: 'Специальные скидки', included: true },
      { text: 'Реферальная программа (10%)', included: true },
      { text: 'Персональный менеджер', included: true },
      { text: 'API доступ', included: true },
    ],
  },
];

const TariffsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectTariff = (tariffId: string) => {
    // Redirect to profile settings to upgrade
    navigate('/settings?tab=tariff&selected=' + tariffId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Выберите свой тариф
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Гибкие тарифы для любого бизнеса
        </Typography>
      </Box>

      {/* Tariffs Grid */}
      <Grid container spacing={4} justifyContent="center">
        {tariffs.map((tariff) => (
          <Grid item xs={12} md={4} key={tariff.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: tariff.popular ? `3px solid ${tariff.color}` : '1px solid #e0e0e0',
                boxShadow: tariff.popular ? 4 : 1,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              {/* Popular Badge */}
              {tariff.popular && (
                <Chip
                  label="Популярный"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    fontWeight: 600,
                    backgroundColor: tariff.color,
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                {/* Icon */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: tariff.color,
                  }}
                >
                  {tariff.icon}
                </Box>

                {/* Title */}
                <Typography
                  variant="h4"
                  component="h2"
                  align="center"
                  gutterBottom
                  fontWeight={700}
                  sx={{ color: tariff.color }}
                >
                  {tariff.name}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  {tariff.description}
                </Typography>

                {/* Price */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h3" component="div" fontWeight={700}>
                    {tariff.price === 0 ? 'Бесплатно' : `${tariff.price} ₸`}
                  </Typography>
                  {tariff.price > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {tariff.period}
                    </Typography>
                  )}
                </Box>

                {/* Features List */}
                <List dense>
                  {tariff.features.map((feature, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckIcon
                          sx={{
                            color: feature.included ? tariff.color : '#ccc',
                            fontSize: 20,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature.text}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: {
                            color: feature.included ? 'text.primary' : 'text.disabled',
                            textDecoration: feature.included ? 'none' : 'line-through',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              {/* Action Button */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant={tariff.popular ? 'contained' : 'outlined'}
                  size="large"
                  onClick={() => handleSelectTariff(tariff.id)}
                  sx={{
                    backgroundColor: tariff.popular ? tariff.color : 'transparent',
                    borderColor: tariff.color,
                    color: tariff.popular ? 'white' : tariff.color,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: tariff.popular ? tariff.color : 'rgba(255, 107, 53, 0.1)',
                      borderColor: tariff.color,
                    },
                  }}
                >
                  {tariff.id === 'free' ? 'Начать бесплатно' : 'Выбрать тариф'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Все цены указаны в тенге (₸). НДС не облагается.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Есть вопросы?{' '}
          <Button
            size="small"
            onClick={() => navigate('/contacts')}
            sx={{ textTransform: 'none' }}
          >
            Свяжитесь с нами
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default TariffsPage;
