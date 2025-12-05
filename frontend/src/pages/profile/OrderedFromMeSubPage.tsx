import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { Receipt as ReceiptIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import BackButton from '../../components/profile/BackButton';
import { ordersAPI } from '../../services/api';

interface OrderItem {
  product_id: string;
  product_title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  product_title: string;
  total_price: number;
  status: string;
  created_at: string;
  buyer_name: string;
  seller_name: string;
}

const OrderedFromMeSubPage: React.FC = () => {
  const navigate = useNavigate();
  const [orderedFromMe, setOrderedFromMe] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    try {
      await ordersAPI.updateOrderStatus(selectedOrder.id, newStatus);
      // Reload orders after status change
      await loadOrderedFromMe();
      handleCloseMenu();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert('Ошибка при изменении статуса заказа');
    }
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
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderedFromMe.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/orders/${order.id}`)}
                >
                  <TableCell>{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.product_title || 'Н/Д'}</TableCell>
                  <TableCell>{order.buyer_name || 'Н/Д'}</TableCell>
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
                    <Button
                      size="small"
                      onClick={(e) => handleOpenMenu(e, order)}
                      startIcon={<MoreVertIcon />}
                    >
                      Статус
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Status Change Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleChangeStatus('processing')}>
          В обработке
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('completed')}>
          Завершён
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('cancelled')}>
          Отменён
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default OrderedFromMeSubPage;
