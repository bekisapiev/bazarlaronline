import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Chip,
  Menu,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Visibility,
  Star,
  AttachMoney,
  NavigateNext,
  CloudDownload,
  ArrowUpward,
  Inventory,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, exportAPI } from '../services/api';

interface DashboardData {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  total_views: number;
  average_rating: number;
}

interface ProductPerformance {
  id: string;
  title: string;
  views: number;
  orders: number;
  revenue: number;
  rating: number;
}

interface RecentOrder {
  id: string;
  product_title: string;
  buyer_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
}

const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);

  const [period, setPeriod] = useState('week');
  const [sortBy, setSortBy] = useState('views');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);

  const loadProductPerformance = useCallback(async () => {
    try {
      const response = await analyticsAPI.getProductPerformance(sortBy, 10);
      setProductPerformance(response.data);
    } catch (err: any) {
      console.error('Error loading product performance:', err);
    }
  }, [sortBy]);

  const loadSalesData = useCallback(async () => {
    try {
      const response = await analyticsAPI.getSalesByPeriod(period);
      setSalesData(response.data);
    } catch (err: any) {
      console.error('Error loading sales data:', err);
    }
  }, [period]);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (period) {
      loadSalesData();
    }
  }, [period, loadSalesData]);

  useEffect(() => {
    if (sortBy) {
      loadProductPerformance();
    }
  }, [sortBy, loadProductPerformance]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      setDashboardData(response.data.overview);
      setRecentOrders(response.data.recent_orders || []);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await exportAPI.exportProductsCSV({});

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Данные успешно экспортированы в CSV');
      setExportMenuAnchor(null);
    } catch (err: any) {
      console.error('Error exporting CSV:', err);
      setError(err.response?.data?.detail || 'Не удалось экспортировать данные');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const response = await exportAPI.exportAnalyticsJSON({});

      // Create blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Данные успешно экспортированы в JSON');
      setExportMenuAnchor(null);
    } catch (err: any) {
      console.error('Error exporting JSON:', err);
      setError(err.response?.data?.detail || 'Не удалось экспортировать данные');
    } finally {
      setExporting(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтверждён';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'cancelled':
        return 'Отменён';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU')} сом`;
  };

  if (loading && !dashboardData) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
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
        <Typography color="text.primary">Панель продавца</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Панель продавца
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Аналитика и управление вашим магазином
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={period}
              label="Период"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="day">День</MenuItem>
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            disabled={exporting}
          >
            {exporting ? 'Экспорт...' : 'Экспорт'}
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={handleExportCSV}>Экспорт CSV</MenuItem>
            <MenuItem onClick={handleExportJSON}>Экспорт JSON</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Overview Cards */}
      {dashboardData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Inventory sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Товары
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {dashboardData.total_products}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    Активные товары
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShoppingCart sx={{ color: 'info.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Заказы
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {dashboardData.total_orders}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    За период
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Выручка
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {formatCurrency(dashboardData.total_revenue)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    Общая выручка
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Просмотры
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {dashboardData.total_views.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main">
                    За период
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Star sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Рейтинг
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {dashboardData.average_rating.toFixed(1)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Средний рейтинг
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sales Chart Placeholder */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Продажи по периоду
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="day">День</MenuItem>
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Simple chart placeholder - you can integrate recharts here */}
        <Box
          sx={{
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.50',
            borderRadius: 1,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              График продаж
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {salesData.length > 0
                ? `${salesData.length} точек данных за ${period === 'day' ? 'день' : period === 'week' ? 'неделю' : period === 'month' ? 'месяц' : 'год'}`
                : 'Загрузка данных...'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Top Performing Products */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Лучшие товары
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="views">По просмотрам</MenuItem>
                  <MenuItem value="orders">По заказам</MenuItem>
                  <MenuItem value="revenue">По выручке</MenuItem>
                  <MenuItem value="rating">По рейтингу</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {productPerformance.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Нет данных о товарах
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Товар</TableCell>
                      <TableCell align="right">Просмотры</TableCell>
                      <TableCell align="right">Заказы</TableCell>
                      <TableCell align="right">Выручка</TableCell>
                      <TableCell align="right">Рейтинг</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productPerformance.map((product, index) => (
                      <TableRow
                        key={product.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={index + 1}
                              size="small"
                              sx={{ mr: 1, minWidth: 32 }}
                              color={index < 3 ? 'primary' : 'default'}
                            />
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {product.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{product.views.toLocaleString()}</TableCell>
                        <TableCell align="right">{product.orders}</TableCell>
                        <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                            {product.rating.toFixed(1)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Последние заказы
              </Typography>
              <Button size="small" onClick={() => navigate('/orders')}>
                Все заказы
              </Button>
            </Box>

            {recentOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Пока нет заказов
                </Typography>
              </Box>
            ) : (
              <Box>
                {recentOrders.slice(0, 5).map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      py: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                        {order.product_title}
                      </Typography>
                      <Chip
                        label={getOrderStatusLabel(order.status)}
                        size="small"
                        color={getOrderStatusColor(order.status) as any}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {order.buyer_name}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(order.amount)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(order.created_at)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

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

export default SellerDashboardPage;
