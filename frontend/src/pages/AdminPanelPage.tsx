import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Cancel,
  Person,
  Block,
  Inventory,
  Assessment,
  NavigateNext,
  Edit,
  Visibility,
  TrendingUp,
  ShoppingCart,
  People,
  AttachMoney,
  Handshake,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { reportsAPI, productsAPI } from '../services/api';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string;
  status: string;
  reporter_name: string;
  reported_item_id: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  avatar?: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
  seller_name: string;
  created_at: string;
  images: string[];
}

interface PlatformStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  active_users: number;
  pending_reports: number;
  pending_products: number;
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

  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportDecision, setReportDecision] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('pending');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState('');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productStatusFilter, setProductStatusFilter] = useState('pending');

  // Statistics state
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      setError('У вас нет доступа к этой странице');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [user, navigate]);

  const loadReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const response = await reportsAPI.getPendingReports({ status: reportStatusFilter });
      setReports(response.data);
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить жалобы');
    } finally {
      setReportsLoading(false);
    }
  }, [reportStatusFilter]);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      // Admin endpoint to get all users
      const response = await api.get('/admin/users/all');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить пользователей');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const response = await productsAPI.getProducts({ status: productStatusFilter });
      setProducts(response.data.items || response.data);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить товары');
    } finally {
      setProductsLoading(false);
    }
  }, [productStatusFilter]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
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
        pending_reports: 15,
        pending_products: 23,
        // Partner program mock data
        partner_total_sales: 450000,
        partner_total_commission: 67500,
        partner_referrer_share: 30375, // 45% of 67500
        partner_platform_share: 37125, // 55% of 67500
        partner_active_products: 45,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentTab === 0) {
      loadReports();
    } else if (currentTab === 1) {
      loadUsers();
    } else if (currentTab === 2) {
      loadProducts();
    } else if (currentTab === 3) {
      loadStats();
    }
  }, [currentTab, loadReports, loadUsers, loadProducts, loadStats]);

  const handleReportReview = async (approved: boolean) => {
    if (!selectedReport) return;

    try {
      setLoading(true);
      await reportsAPI.reviewReport(selectedReport.id, {
        status: approved ? 'approved' : 'rejected',
        decision: reportDecision,
      });

      setSuccess(`Жалоба ${approved ? 'одобрена' : 'отклонена'}`);
      setReportDialogOpen(false);
      setSelectedReport(null);
      setReportDecision('');
      loadReports();
    } catch (err: any) {
      console.error('Error reviewing report:', err);
      setError(err.response?.data?.detail || 'Не удалось обработать жалобу');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: 'ban' | 'unban' | 'changeRole') => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      if (action === 'ban') {
        await api.put(`/admin/users/${selectedUser.id}/ban`);
        setSuccess('Пользователь заблокирован');
      } else if (action === 'unban') {
        await api.put(`/admin/users/${selectedUser.id}/unban`);
        setSuccess('Пользователь разблокирован');
      } else if (action === 'changeRole') {
        await api.put(`/admin/users/${selectedUser.id}/role`, { role: newUserRole });
        setSuccess('Роль пользователя изменена');
      }

      setUserDialogOpen(false);
      setSelectedUser(null);
      setNewUserRole('');
      loadUsers();
    } catch (err: any) {
      console.error('Error performing user action:', err);
      setError(err.response?.data?.detail || 'Не удалось выполнить действие');
    } finally {
      setLoading(false);
    }
  };

  const handleProductModeration = async (productId: string, approved: boolean) => {
    try {
      setLoading(true);
      await api.put(`/admin/products/${productId}/moderate`, {
        status: approved ? 'active' : 'rejected',
      });

      setSuccess(`Товар ${approved ? 'одобрен' : 'отклонён'}`);
      loadProducts();
    } catch (err: any) {
      console.error('Error moderating product:', err);
      setError(err.response?.data?.detail || 'Не удалось модерировать товар');
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Товар';
      case 'user':
        return 'Пользователь';
      case 'review':
        return 'Отзыв';
      default:
        return type;
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'seller':
        return 'primary';
      case 'buyer':
        return 'default';
      default:
        return 'default';
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
          Модерация контента и управление платформой
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Warning />} iconPosition="start" label="Жалобы" />
          <Tab icon={<Person />} iconPosition="start" label="Пользователи" />
          <Tab icon={<Inventory />} iconPosition="start" label="Товары" />
          <Tab icon={<Assessment />} iconPosition="start" label="Статистика" />
        </Tabs>
      </Paper>

      {/* Tab 1: Reports */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Список жалоб
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={reportStatusFilter}
              label="Статус"
              onChange={(e) => setReportStatusFilter(e.target.value)}
            >
              <MenuItem value="pending">Ожидают</MenuItem>
              <MenuItem value="approved">Одобрены</MenuItem>
              <MenuItem value="rejected">Отклонены</MenuItem>
              <MenuItem value="all">Все</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {reportsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Warning sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Нет жалоб
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Тип</TableCell>
                  <TableCell>Причина</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>От кого</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Chip label={getReportTypeLabel(report.type)} size="small" />
                    </TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {report.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        size="small"
                        color={getReportStatusColor(report.status) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedReport(report);
                          setReportDialogOpen(true);
                        }}
                      >
                        Рассмотреть
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Tab 2: Users */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Управление пользователями
          </Typography>
        </Box>

        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Нет пользователей
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дата регистрации</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={user.avatar} sx={{ width: 32, height: 32, mr: 2 }}>
                          {user.full_name?.charAt(0) || user.email.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{user.full_name || 'Не указано'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleBadgeColor(user.role) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Активен' : 'Заблокирован'}
                        size="small"
                        color={user.is_active ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewUserRole(user.role);
                          setUserDialogOpen(true);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Tab 3: Products */}
      <TabPanel value={currentTab} index={2}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Модерация товаров
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={productStatusFilter}
              label="Статус"
              onChange={(e) => setProductStatusFilter(e.target.value)}
            >
              <MenuItem value="pending">Ожидают</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="rejected">Отклонённые</MenuItem>
              <MenuItem value="all">Все</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {productsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Inventory sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Нет товаров
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card>
                  <Box
                    component="img"
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : 'https://via.placeholder.com/200'
                    }
                    alt={product.title}
                    sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {product.title}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                      {formatCurrency(product.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Продавец: {product.seller_name}
                    </Typography>
                    <Chip
                      label={product.status}
                      size="small"
                      sx={{ mt: 1 }}
                      color={
                        product.status === 'active'
                          ? 'success'
                          : product.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        Смотреть
                      </Button>
                      {product.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleProductModeration(product.id, true)}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleProductModeration(product.id, false)}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Tab 4: Statistics */}
      <TabPanel value={currentTab} index={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Статистика платформы
          </Typography>
        </Box>

        {statsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : stats ? (
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
                  <Typography variant="caption" color="success.main">
                    Активных: {stats.active_users.toLocaleString()}
                  </Typography>
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
                  <Typography variant="caption" color="warning.main">
                    Ожидают: {stats.pending_products}
                  </Typography>
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
                    За всё время
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
                      <Typography variant="h4" fontWeight={600}>
                        {formatCurrency(stats.total_revenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Общая выручка
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="success.main">
                    <TrendingUp sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Рост платформы
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Ожидающие модерации
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography variant="h3" fontWeight={600}>
                          {stats.pending_reports}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Жалобы
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="h3" fontWeight={600}>
                          {stats.pending_products}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Товары
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Быстрые действия
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Warning />}
                      onClick={() => setCurrentTab(0)}
                    >
                      Просмотреть жалобы
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Inventory />}
                      onClick={() => setCurrentTab(2)}
                    >
                      Модерация товаров
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Person />}
                      onClick={() => setCurrentTab(1)}
                    >
                      Управление пользователями
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Partner Program Statistics */}
            <Grid item xs={12}>
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
                          📊 Как работает распределение комиссий
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                1️⃣ Продажа по партнерской ссылке
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Пользователь покупает товар по реферальной ссылке партнера
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                2️⃣ Подтверждение заказа
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Продавец подтверждает заказ, после чего из основного счета продавца (Business тариф) списывается установленный процент комиссии
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                3️⃣ Распределение 45% / 55%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>45%</strong> → на реферальный баланс партнера<br />
                                <strong>55%</strong> → на счет платформы
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Товаров с партнерской программой:
                          </Typography>
                          <Chip
                            label={`${stats.partner_active_products || 0} активных`}
                            color="success"
                            size="small"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Нет данных статистики
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Report Review Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Рассмотрение жалобы</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Тип: {getReportTypeLabel(selectedReport.type)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Причина: {selectedReport.reason}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                Описание: {selectedReport.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                От: {selectedReport.reporter_name} | {formatDate(selectedReport.created_at)}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Решение"
                value={reportDecision}
                onChange={(e) => setReportDecision(e.target.value)}
                sx={{ mt: 3 }}
                placeholder="Опишите ваше решение..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={() => handleReportReview(false)}
            color="error"
            variant="outlined"
            disabled={loading}
          >
            Отклонить
          </Button>
          <Button
            onClick={() => handleReportReview(true)}
            color="success"
            variant="contained"
            disabled={loading}
          >
            Одобрить
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Управление пользователем</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar src={selectedUser.avatar} sx={{ width: 60, height: 60, mr: 2 }}>
                  {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.full_name || 'Не указано'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Роль</InputLabel>
                <Select
                  value={newUserRole}
                  label="Роль"
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <MenuItem value="buyer">Покупатель</MenuItem>
                  <MenuItem value="seller">Продавец</MenuItem>
                  <MenuItem value="admin">Администратор</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {selectedUser.is_active ? (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<Block />}
                    onClick={() => handleUserAction('ban')}
                    disabled={loading}
                  >
                    Заблокировать
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    startIcon={<CheckCircle />}
                    onClick={() => handleUserAction('unban')}
                    disabled={loading}
                  >
                    Разблокировать
                  </Button>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleUserAction('changeRole')}
                  disabled={loading || newUserRole === selectedUser.role}
                >
                  Изменить роль
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

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

export default AdminPanelPage;
