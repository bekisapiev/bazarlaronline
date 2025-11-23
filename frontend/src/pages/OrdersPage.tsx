import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
} from '@mui/material';
import {
  ShoppingBag as OrderIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ordersAPI } from '../services/api';

interface OrderItem {
  product_id: string;
  product_title: string;
  product_image?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  seller: {
    id: string;
    shop_name: string;
    phone?: string;
  };
  buyer: {
    id: string;
    full_name: string;
    phone?: string;
  };
}

const ORDER_STATUSES = {
  pending: { label: 'Ожидает', color: 'warning' as const },
  confirmed: { label: 'Подтвержден', color: 'info' as const },
  processing: { label: 'В обработке', color: 'primary' as const },
  shipped: { label: 'Отправлен', color: 'secondary' as const },
  delivered: { label: 'Доставлен', color: 'success' as const },
  cancelled: { label: 'Отменен', color: 'error' as const },
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Order detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // Load orders as seller (received orders)
      const sellerResponse = await ordersAPI.getOrders({ role: 'seller' });
      const sellerOrders = Array.isArray(sellerResponse.data)
        ? sellerResponse.data
        : (sellerResponse.data.items || []);

      // Load orders as buyer (placed orders)
      const buyerResponse = await ordersAPI.getOrders({ role: 'buyer' });
      const buyerOrders = Array.isArray(buyerResponse.data)
        ? buyerResponse.data
        : (buyerResponse.data.items || []);

      setReceivedOrders(sellerOrders);
      setPlacedOrders(buyerOrders);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      await loadOrders();

      if (selectedOrder?.id === orderId) {
        const updatedOrder = receivedOrders.find((o) => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status: newStatus });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка обновления статуса');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const filterOrders = (orders: Order[]) => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  };

  const renderOrderCard = (order: Order, isReceived: boolean) => {
    const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || {
      label: order.status,
      color: 'default' as const,
    };

    return (
      <Card key={order.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Заказ #{order.order_number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(order.created_at).toLocaleString('ru-RU')}
              </Typography>
            </Box>
            <Chip label={statusInfo.label} color={statusInfo.color} />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                {isReceived ? 'Покупатель:' : 'Продавец:'}
              </Typography>
              <Typography variant="body1">
                {isReceived ? order.buyer.full_name : order.seller.shop_name}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Товаров:
              </Typography>
              <Typography variant="body1">{order.items.length}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Сумма:
              </Typography>
              <Typography variant="h6" color="primary">
                {order.total_amount} сом
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Адрес доставки:
              </Typography>
              <Typography variant="body2">{order.delivery_address}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => handleViewDetails(order)}
            >
              Подробнее
            </Button>

            {isReceived && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={updatingStatus}
                >
                  <MenuItem value="pending">Ожидает</MenuItem>
                  <MenuItem value="confirmed">Подтвержден</MenuItem>
                  <MenuItem value="processing">В обработке</MenuItem>
                  <MenuItem value="shipped">Отправлен</MenuItem>
                  <MenuItem value="delivered">Доставлен</MenuItem>
                  <MenuItem value="cancelled">Отменить</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const currentOrders = activeTab === 0 ? receivedOrders : placedOrders;
  const filteredOrders = filterOrders(currentOrders);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Заказы</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Мои заказы
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label={`Мне заказали (${receivedOrders.length})`} />
          <Tab label={`Я заказал (${placedOrders.length})`} />
        </Tabs>
      </Paper>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={statusFilter}
            label="Статус"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="pending">Ожидает</MenuItem>
            <MenuItem value="confirmed">Подтвержден</MenuItem>
            <MenuItem value="processing">В обработке</MenuItem>
            <MenuItem value="shipped">Отправлен</MenuItem>
            <MenuItem value="delivered">Доставлен</MenuItem>
            <MenuItem value="cancelled">Отменен</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <OrderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {statusFilter === 'all' ? 'Заказов пока нет' : 'Нет заказов с выбранным статусом'}
          </Typography>
        </Paper>
      ) : (
        <Box>
          {filteredOrders.map((order) => renderOrderCard(order, activeTab === 0))}
        </Box>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Заказ #{selectedOrder.order_number}</Typography>
                <Chip
                  label={
                    ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES]?.label ||
                    selectedOrder.status
                  }
                  color={
                    ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES]?.color ||
                    'default'
                  }
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Информация о доставке
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography variant="body2">{selectedOrder.delivery_address}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Typography variant="body2">{selectedOrder.phone_number}</Typography>
                  </Box>
                </Stack>
              </Box>

              {selectedOrder.notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Примечания
                  </Typography>
                  <Typography variant="body2">{selectedOrder.notes}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Товары
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Товар</TableCell>
                      <TableCell align="center">Количество</TableCell>
                      <TableCell align="right">Цена</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={item.product_image || '/placeholder.png'}
                              alt={item.product_title}
                              variant="rounded"
                            />
                            <Typography variant="body2">{item.product_title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{item.price} сом</TableCell>
                        <TableCell align="right">{item.price * item.quantity} сом</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Итого:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          {selectedOrder.total_amount} сом
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Создан: {new Date(selectedOrder.created_at).toLocaleString('ru-RU')}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Обновлен: {new Date(selectedOrder.updated_at).toLocaleString('ru-RU')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Закрыть</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default OrdersPage;
