import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
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
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  Tabs,
  Tab,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Edit,
  Delete,
  Warning,
  CheckCircle,
  Cancel,
  Visibility,
  NavigateNext,
  FilterList,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';

interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
  seller_name: string;
  created_at: string;
  images: string[];
  description: string;
  category_id?: number;
}

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form data
  const [warningMessage, setWarningMessage] = useState('');
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setError('У вас нет доступа к этой странице');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [user, navigate]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/products/', { params });
      setProducts(response.data.items || response.data);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const [pendingRes, activeRes, rejectedRes, totalRes] = await Promise.all([
        api.get('/products/', { params: { status: 'pending' } }),
        api.get('/products/', { params: { status: 'active' } }),
        api.get('/products/', { params: { status: 'rejected' } }),
        api.get('/products/'),
      ]);

      setStats({
        pending: (pendingRes.data.items || pendingRes.data).length,
        active: (activeRes.data.items || activeRes.data).length,
        rejected: (rejectedRes.data.items || rejectedRes.data).length,
        total: (totalRes.data.items || totalRes.data).length,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [loadProducts, loadStats]);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      setLoading(true);
      await api.put(`/products/admin/${productId}/moderate`, { status: newStatus });
      setSuccess(`Статус товара изменен на "${newStatus}"`);
      loadProducts();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось изменить статус');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      await api.put(`/products/${selectedProduct.id}`, editedProduct);
      setSuccess('Товар успешно обновлен');
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setEditedProduct({});
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось обновить товар');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      await api.delete(`/products/${selectedProduct.id}`);
      setSuccess('Товар успешно удален');
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      loadProducts();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось удалить товар');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWarning = async () => {
    if (!selectedProduct || !warningMessage.trim()) {
      setError('Введите текст предупреждения');
      return;
    }

    try {
      setLoading(true);
      // Send notification to seller
      await api.post('/notifications/', {
        user_id: selectedProduct.id,
        title: 'Предупреждение по товару',
        message: `Товар "${selectedProduct.title}": ${warningMessage}`,
        type: 'warning',
      });
      setSuccess('Предупреждение отправлено продавцу');
      setWarningDialogOpen(false);
      setWarningMessage('');
      setSelectedProduct(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось отправить предупреждение');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditedProduct({
      title: product.title,
      description: product.description,
      price: product.price,
      status: product.status,
    });
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'active':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
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
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <MuiLink component={Link} to="/admin" underline="hover" color="inherit">
          Админ-панель
        </MuiLink>
        <Typography color="text.primary">Товары и услуги</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Управление товарами и услугами
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Модерация, редактирование и удаление товаров
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                На модерации
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Активные
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={600} color="error.main">
                {stats.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Отклоненные
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего товаров
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Поиск по названию"
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ maxWidth: { md: 400 } }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              label="Статус"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="pending">На модерации</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="rejected">Отклоненные</MenuItem>
              <MenuItem value="all">Все</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={loadProducts}
          >
            Применить
          </Button>
        </Stack>
      </Paper>

      {/* Products Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Товары не найдены
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Изображение</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Продавец</TableCell>
                <TableCell>Цена</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box
                      component="img"
                      src={product.images?.[0] || 'https://via.placeholder.com/50'}
                      alt={product.title}
                      sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {product.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{product.seller_name}</TableCell>
                  <TableCell>{product.price} сом</TableCell>
                  <TableCell>
                    <Chip
                      label={product.status}
                      size="small"
                      color={getStatusColor(product.status) as any}
                    />
                  </TableCell>
                  <TableCell>{formatDate(product.created_at)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/products/${product.id}`)}
                        title="Просмотр"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openEditDialog(product)}
                        title="Редактировать"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => {
                          setSelectedProduct(product);
                          setWarningDialogOpen(true);
                        }}
                        title="Предупреждение"
                      >
                        <Warning fontSize="small" />
                      </IconButton>
                      {product.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(product.id, 'active')}
                            title="Одобрить"
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleStatusChange(product.id, 'rejected')}
                            title="Отклонить"
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteDialogOpen(true);
                        }}
                        title="Удалить"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать товар</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Название"
              fullWidth
              value={editedProduct.title || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, title: e.target.value })}
            />
            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={4}
              value={editedProduct.description || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
            />
            <TextField
              label="Цена"
              fullWidth
              type="number"
              value={editedProduct.price || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={editedProduct.status || ''}
                label="Статус"
                onChange={(e) => setEditedProduct({ ...editedProduct, status: e.target.value })}
              >
                <MenuItem value="pending">На модерации</MenuItem>
                <MenuItem value="active">Активный</MenuItem>
                <MenuItem value="rejected">Отклонен</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained" disabled={loading}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить товар "{selectedProduct?.title}"?
            Это действие необратимо.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={warningDialogOpen} onClose={() => setWarningDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отправить предупреждение</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Товар: {selectedProduct?.title}
          </Typography>
          <TextField
            label="Текст предупреждения"
            fullWidth
            multiline
            rows={4}
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Опишите проблему с товаром..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSendWarning} variant="contained" color="warning" disabled={loading}>
            Отправить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
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

export default AdminProductsPage;
