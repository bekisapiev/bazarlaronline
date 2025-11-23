import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  NavigateNext,
  Receipt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

interface Order {
  id: string;
  product_title: string;
  total_price: number;
  status: string;
  created_at: string;
  seller_name: string;
}

const OrdersFromMePage: React.FC = () => {
  const navigate = useNavigate();
  const [orderedFromMe, setOrderedFromMe] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderedFromMe();
  }, []);

  const loadOrderedFromMe = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrders({ type: 'seller' });
      const ordersData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setOrderedFromMe(ordersData);
    } catch (err: any) {
      console.error('Error loading seller orders:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
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

  if (loading) {
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
        <Typography color="text.primary">Мне заказали</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Мне заказали
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {orderedFromMe.length > 0
            ? `Всего заказов: ${orderedFromMe.length}`
            : 'Нет заказов от покупателей'}
        </Typography>
      </Box>

      {/* Content */}
      {orderedFromMe.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Нет заказов от покупателей
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Когда кто-то закажет ваши товары, они появятся здесь
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID заказа</TableCell>
                <TableCell>Товар</TableCell>
                <TableCell>Покупатель</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderedFromMe.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.product_title}</TableCell>
                  <TableCell>{order.seller_name}</TableCell>
                  <TableCell>{order.total_price} сом</TableCell>
                  <TableCell>
                    <Chip
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default OrdersFromMePage;
