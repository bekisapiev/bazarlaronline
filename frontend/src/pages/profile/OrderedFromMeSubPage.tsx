import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
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
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import BackButton from '../../components/profile/BackButton';
import { ordersAPI } from '../../services/api';

interface Order {
  id: string;
  product_title: string;
  total_price: number;
  status: string;
  created_at: string;
  seller_name: string; // Actually buyer name when role=seller
}

const OrderedFromMeSubPage: React.FC = () => {
  const [orderedFromMe, setOrderedFromMe] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    loadOrderedFromMe();
  }, []);

  const loadOrderedFromMe = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getOrders({ role: 'seller' });
      const ordersData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setOrderedFromMe(ordersData);
    } catch (err: any) {
      console.error('Error loading seller orders:', err);
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

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <BackButton title="Мне заказали" />

      {ordersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : orderedFromMe.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrderedFromMeSubPage;
