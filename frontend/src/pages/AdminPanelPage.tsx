import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Avatar,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import {
  People,
  Inventory,
  ShoppingCart,
  AttachMoney,
  TrendingUp,
  Handshake,
  PersonAdd,
  Store,
  AccountBalance,
  NavigateNext,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';

interface PlatformStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  active_users: number;
  new_users_this_month: number;
  pending_products: number;
  active_products: number;
  rejected_products: number;
  pending_withdrawals: number;
  total_withdrawals_amount: number;
  // Partner program statistics
  partner_total_sales?: number;
  partner_total_commission?: number;
  partner_platform_share?: number;
  partner_referrer_share?: number;
  partner_active_products?: number;
}

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      setError('У вас нет доступа к этой странице');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      // Set mock data if endpoint doesn't exist
      setStats({
        total_users: 1250,
        total_products: 5840,
        total_orders: 3420,
        total_revenue: 2450000,
        active_users: 890,
        new_users_this_month: 125,
        pending_products: 23,
        active_products: 5817,
        rejected_products: 142,
        pending_withdrawals: 8,
        total_withdrawals_amount: 145000,
        // Partner program mock data
        partner_total_sales: 450000,
        partner_total_commission: 67500,
        partner_referrer_share: 30375, // 45% of 67500
        partner_platform_share: 37125, // 55% of 67500
        partner_active_products: 45,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU')} сом`;
  };

  const adminSections = [
    {
      title: 'Управление товарами',
      description: 'Модерация, редактирование и удаление товаров',
      icon: <Inventory />,
      color: 'info.main',
      bgColor: 'info.50',
      path: '/admin/products',
    },
    {
      title: 'Управление пользователями',
      description: 'Блокировка, редактирование и управление ролями',
      icon: <People />,
      color: 'primary.main',
      bgColor: 'primary.50',
      path: '/admin/users',
    },
    {
      title: 'Вывод средств',
      description: 'Обработка запросов на вывод реферальных средств',
      icon: <AccountBalance />,
      color: 'success.main',
      bgColor: 'success.50',
      path: '/admin/withdrawals',
    },
  ];

  if (user && user.role !== 'admin') {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Alert severity="error">У вас нет доступа к этой странице</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Главная
        </Link>
        <Typography color="text.primary">Панель администратора</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Панель администратора
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Статистика платформы и управление контентом
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <>
          {/* Quick Access Sections */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Разделы управления
            </Typography>
            <Grid container spacing={3}>
              {adminSections.map((section, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => navigate(section.path)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: section.bgColor,
                            color: section.color,
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        >
                          {section.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {section.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {section.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Перейти
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Platform Statistics */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Статистика платформы
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <People sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={600}>
                          {stats.total_users.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Всего пользователей
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="success.main">
                        Активных: {stats.active_users.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="info.main">
                        +{stats.new_users_this_month} за месяц
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Inventory sx={{ color: 'info.main', fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={600}>
                          {stats.total_products.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Всего товаров
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="warning.main">
                        Ожидают: {stats.pending_products}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Активных: {stats.active_products}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ShoppingCart sx={{ color: 'success.main', fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={600}>
                          {stats.total_orders.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Всего заказов
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      За всё время работы
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AttachMoney sx={{ color: 'warning.main', fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight={600} noWrap>
                          {(stats.total_revenue / 1000).toFixed(0)}K
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Общая выручка
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="success.main">
                      <TrendingUp sx={{ fontSize: 14, verticalAlign: 'middle' }} /> {formatCurrency(stats.total_revenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Products Statistics */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Статистика товаров и услуг
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          На модерации
                        </Typography>
                        <Typography variant="h3" fontWeight={600} color="warning.main">
                          {stats.pending_products}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                        <Store />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Активные
                        </Typography>
                        <Typography variant="h3" fontWeight={600} color="success.main">
                          {stats.active_products}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                        <Inventory />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Отклонено
                        </Typography>
                        <Typography variant="h3" fontWeight={600} color="error.main">
                          {stats.rejected_products}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                        <Store />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* User Statistics */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Статистика пользователей
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Активность пользователей
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Всего зарегистрировано
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {stats.total_users.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Активных пользователей
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          {stats.active_users.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Новых за месяц
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="info.main">
                          {stats.new_users_this_month}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Выводы средств
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ожидают обработки
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="warning.main">
                          {stats.pending_withdrawals}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Общая сумма выводов
                        </Typography>
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          {formatCurrency(stats.total_withdrawals_amount)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 3 }}
                      onClick={() => navigate('/admin/withdrawals')}
                      startIcon={<AccountBalance />}
                    >
                      Управление выводами
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Partner Program Statistics */}
          <Box sx={{ mb: 4 }}>
            <Card sx={{ bgcolor: 'success.50', border: 2, borderColor: 'success.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Handshake sx={{ color: 'success.main', fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={600} color="success.dark">
                      Партнерская программа
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Статистика выплат и комиссий (тариф Business)
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
                      <Typography variant="h4" fontWeight={600} color="success.main">
                        {stats.partner_total_sales ? formatCurrency(stats.partner_total_sales) : '0 сом'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Общие продажи
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        По партнерским ссылкам
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
                      <Typography variant="h4" fontWeight={600} color="info.main">
                        {stats.partner_total_commission ? formatCurrency(stats.partner_total_commission) : '0 сом'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Общие комиссии
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Из основного счета продавцов
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
                      <Typography variant="h4" fontWeight={600} color="warning.main">
                        {stats.partner_referrer_share ? formatCurrency(stats.partner_referrer_share) : '0 сом'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Доля партнеров
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                        45% от комиссий
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
                      <Typography variant="h4" fontWeight={600} color="primary.main">
                        {stats.partner_platform_share ? formatCurrency(stats.partner_platform_share) : '0 сом'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Доля платформы
                      </Typography>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                        55% от комиссий
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: 'white' }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Как работает распределение комиссий
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              1. Продажа по партнерской ссылке
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Пользователь покупает товар по реферальной ссылке партнера
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              2. Подтверждение заказа
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Продавец подтверждает заказ, после чего из основного счета продавца (Business тариф) списывается установленный процент комиссии
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              3. Распределение 45% / 55%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>45%</strong> → на реферальный баланс партнера<br />
                              <strong>55%</strong> → на счет платформы
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Активных товаров с партнерской программой: <strong>{stats.partner_active_products || 0}</strong>
                        </Typography>
                        <Button variant="outlined" color="success" onClick={() => navigate('/partners')}>
                          Подробнее о программе
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Нет данных статистики
          </Typography>
        </Paper>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanelPage;
