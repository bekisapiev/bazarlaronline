import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Check as CheckIcon, Star as StarIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const TariffsPage: React.FC = () => {
  const navigate = useNavigate();

  const tariffs = [
    {
      name: 'Free',
      price: 0,
      period: 'навсегда',
      popular: false,
      features: [
        'До 10 активных товаров',
        'До 1000 неопубликованных товаров',
        'Поднятие объявления: 20 сом',
        'Базовая статистика просмотров',
      ],
      limitations: [
        'Не показывается в каталоге продавцов',
        'Без автоподнятия объявлений',
        'Без партнерской программы',
        'Без онлайн-платежей',
      ],
    },
    {
      name: 'Pro',
      price: 500,
      period: 'месяц',
      popular: true,
      features: [
        'До 100 активных товаров',
        'До 1000 неопубликованных товаров',
        'Показывается в каталоге продавцов',
        'Поднятие объявления: 15 сом',
        'Автоподнятие каждые 30 минут за 15 сом',
        'Онлайн-платежи',
        'Детальная статистика',
      ],
      limitations: [
        'Без партнерской программы',
      ],
    },
    {
      name: 'Business',
      price: 2000,
      period: 'месяц',
      popular: false,
      features: [
        'До 1000 активных товаров',
        'До 1000 неопубликованных товаров',
        'Показывается в каталоге продавцов',
        'Поднятие объявления: 10 сом',
        'Автоподнятие каждые 30 минут за 10 сом',
        'Партнерская программа',
        'Онлайн-платежи',
        'Расширенная аналитика',
        'Собственный магазин с баннером',
      ],
      limitations: [],
    },
  ];

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Тарифы</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Тарифные планы
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Выберите оптимальный тариф для развития вашего бизнеса на Bazarlar Online
        </Typography>
      </Box>

      {/* Tariffs Grid */}
      <Grid container spacing={4} sx={{ mb: 8 }} justifyContent="center">
        {tariffs.map((tariff) => (
          <Grid item xs={12} sm={6} md={4} key={tariff.name}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: tariff.popular ? 3 : 1,
                borderColor: tariff.popular ? 'primary.main' : 'divider',
                boxShadow: tariff.popular ? 6 : 1,
                '&:hover': {
                  boxShadow: 8,
                  transform: 'translateY(-8px)',
                  transition: 'all 0.3s',
                },
              }}
            >
              {tariff.popular && (
                <Chip
                  label="Популярный"
                  color="primary"
                  icon={<StarIcon />}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  {tariff.name}
                </Typography>

                <Box sx={{ my: 3 }}>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {tariff.price > 0 ? `${tariff.price}` : 'Бесплатно'}
                  </Typography>
                  {tariff.price > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      сом / {tariff.period}
                    </Typography>
                  )}
                </Box>

                <List sx={{ mb: 3 }}>
                  {tariff.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                  {tariff.limitations.map((limitation, index) => (
                    <ListItem key={`limit-${index}`} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={limitation}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                          sx: { fontStyle: 'italic' },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant={tariff.popular ? 'contained' : 'outlined'}
                  color="primary"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Выбрать тариф
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info */}
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} textAlign="center">
          Часто задаваемые вопросы
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Можно ли сменить тариф?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Да, вы можете изменить тариф в любое время. При повышении тарифа доплата
                рассчитывается пропорционально оставшемуся периоду.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Как производится оплата?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Оплата принимается банковскими картами, через ЭЛСОМ, О!Деньги, MegaPay и
                другие платежные системы Кыргызстана.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Что такое автоподнятие?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Автоподнятие автоматически поднимает ваши объявления каждые 30 минут,
                чтобы они всегда были в топе поиска. Доступно на тарифах Pro и Business.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Что такое партнерская программа?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                На тарифе Business вы можете устанавливать партнерский процент для
                товаров, и другие пользователи смогут зарабатывать на продвижении
                ваших товаров.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TariffsPage;
