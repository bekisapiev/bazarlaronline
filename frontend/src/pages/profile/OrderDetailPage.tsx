import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import BackButton from '../../components/profile/BackButton';
import { ordersAPI, usersAPI } from '../../services/api';

interface OrderItem {
  product_id: string;
  product_title: string;
  quantity: number;
  price: number;
  discount_price: number | null;
}

interface OrderDetail {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  items: OrderItem[];
  total_amount: number;
  delivery_address: string | null;
  phone_number: string | null;
  payment_method: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadOrderDetails();
  }, [orderId]);

  const loadCurrentUser = async () => {
    try {
      const response = await usersAPI.getCurrentUser();
      setCurrentUserId(response.data.id);
    } catch (err: any) {
      console.error('Error loading current user:', err);
    }
  };

  const loadOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getOrderById(orderId);
      setOrder(response.data);
    } catch (err: any) {
      console.error('Error loading order details:', err);
      setError(err.response?.data?.detail || 'Ошибка при загрузке заказа');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
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
      case 'processing':
        return 'В обработке';
      case 'completed':
        return 'Завершён';
      case 'cancelled':
        return 'Отменён';
      default:
        return status;
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!orderId || !order) return;

    const confirmMessage = newStatus === 'cancelled'
      ? 'Вы уверены, что хотите отменить заказ?'
      : `Изменить статус заказа на "${getOrderStatusLabel(newStatus)}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setStatusChanging(true);
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      await loadOrderDetails();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert('Ошибка при изменении статуса заказа');
    } finally {
      setStatusChanging(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateItemTotal = (item: OrderItem) => {
    const price = item.discount_price || item.price;
    return price * item.quantity;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
        <BackButton title="Детали заказа" />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
        <BackButton title="Детали заказа" />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Заказ не найден'}
        </Alert>
      </Container>
    );
  }

  const isSeller = currentUserId === order.seller_id;
  const isBuyer = currentUserId === order.buyer_id;

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <BackButton title="Детали заказа" />

      <Paper sx={{ p: 3, mt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Заказ #{order.order_number}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Создан: {formatDate(order.created_at)}
            </Typography>
          </Box>
          <Chip
            label={getOrderStatusLabel(order.status)}
            color={getOrderStatusColor(order.status) as any}
            size="medium"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Order Items */}
        <Typography variant="h6" gutterBottom>
          Товары и услуги
        </Typography>
        <TableContainer sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell align="right">Цена</TableCell>
                <TableCell align="right">Количество</TableCell>
                <TableCell align="right">Сумма</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product_title}</TableCell>
                  <TableCell align="right">
                    {item.discount_price ? (
                      <>
                        <Typography
                          component="span"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}
                        >
                          {item.price} сом
                        </Typography>
                        <Typography component="span" color="error.main" fontWeight="bold">
                          {item.discount_price} сом
                        </Typography>
                      </>
                    ) : (
                      `${item.price} сом`
                    )}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {calculateItemTotal(item)} сом
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <Typography variant="h6">Итого:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" color="primary.main">
                    {order.total_amount} сом
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Order Details */}
        <Typography variant="h6" gutterBottom>
          Детали доставки
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Адрес доставки:
            </Typography>
            <Typography variant="body1">
              {order.delivery_address || 'Не указан'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Телефон:
            </Typography>
            <Typography variant="body1">
              {order.phone_number || 'Не указан'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Способ оплаты:
            </Typography>
            <Typography variant="body1">
              {order.payment_method === 'cash' ? 'Наличными при получении' : order.payment_method || 'Не указан'}
            </Typography>
          </Grid>
          {order.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Примечание:
              </Typography>
              <Typography variant="body1">
                {order.notes}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Status Management Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {isSeller && (
            <>
              <Typography variant="h6" sx={{ width: '100%', mb: 1 }}>
                Управление заказом
              </Typography>
              {order.status === 'pending' && (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => handleChangeStatus('processing')}
                  disabled={statusChanging}
                >
                  Взять в обработку
                </Button>
              )}
              {(order.status === 'pending' || order.status === 'processing') && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleChangeStatus('completed')}
                  disabled={statusChanging}
                >
                  Завершить заказ
                </Button>
              )}
              {order.status !== 'cancelled' && order.status !== 'completed' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleChangeStatus('cancelled')}
                  disabled={statusChanging}
                >
                  Отменить заказ
                </Button>
              )}
            </>
          )}

          {isBuyer && !isSeller && order.status === 'pending' && (
            <>
              <Typography variant="h6" sx={{ width: '100%', mb: 1 }}>
                Действия
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleChangeStatus('cancelled')}
                disabled={statusChanging}
              >
                Отменить заказ
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderDetailPage;
