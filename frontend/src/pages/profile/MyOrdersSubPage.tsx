import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import BackButton from '../../components/profile/BackButton';
import { ordersAPI } from '../../services/api';

interface Order {
  id: string;
  product_title: string;
  total_price: number;
  status: string;
  created_at: string;
  buyer_name: string;
  seller_name: string;
}

const MyOrdersSubPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getOrders({ role: 'buyer' });
      const ordersData = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setOrders(ordersData);
    } catch (err: any) {
      console.error('Error loading orders:', err);
    } finally {
      setOrdersLoading(false);
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

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Вы уверены, что хотите отменить заказ?')) {
      return;
    }

    try {
      setCancelingOrder(orderId);
      await ordersAPI.updateOrderStatus(orderId, 'cancelled');
      // Reload orders after cancellation
      await loadOrders();
    } catch (err: any) {
      console.error('Error canceling order:', err);
      alert('Ошибка при отмене заказа');
    } finally {
      setCancelingOrder(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <BackButton title="Мои заказы" />

      {ordersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет заказов
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Начать покупки
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID заказа</TableCell>
                <TableCell>Товар</TableCell>
                <TableCell>Продавец</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/orders/${order.id}`)}
                >
                  <TableCell>{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.product_title || 'Н/Д'}</TableCell>
                  <TableCell>{order.seller_name || 'Н/Д'}</TableCell>
                  <TableCell>{order.total_price} сом</TableCell>
                  <TableCell>
                    <Chip
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {order.status === 'pending' && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelingOrder === order.id}
                      >
                        {cancelingOrder === order.id ? 'Отменяем...' : 'Отменить'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default MyOrdersSubPage;
