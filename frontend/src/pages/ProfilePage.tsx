import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Person,
  ShoppingBag,
  AccountBalanceWallet,
  Favorite,
  History,
  Edit,
  Save,
  Cancel,
  NavigateNext,
  CloudUpload,
  Add,
  Remove,
  FavoriteBorder,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import {
  usersAPI,
  ordersAPI,
  walletAPI,
  favoritesAPI,
  uploadAPI,
} from '../services/api';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  created_at: string;
}

interface Order {
  id: string;
  product_title: string;
  total_price: number;
  status: string;
  created_at: string;
  seller_name: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

interface ViewHistoryItem {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images: string[];
  viewed_at: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile tab state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Orders tab state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wallet tab state
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Favorites tab state
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // History tab state
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (currentTab === 1 && orders.length === 0) {
      loadOrders();
    } else if (currentTab === 2 && transactions.length === 0) {
      loadWallet();
    } else if (currentTab === 3 && favorites.length === 0) {
      loadFavorites();
    } else if (currentTab === 4 && viewHistory.length === 0) {
      loadViewHistory();
    }
  }, [currentTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getCurrentUser();
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getOrders();
      setOrders(response.data);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить заказы');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions({ limit: 20, offset: 0 }),
      ]);
      setWalletBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data);
    } catch (err: any) {
      console.error('Error loading wallet:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить кошелёк');
    } finally {
      setWalletLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const response = await favoritesAPI.getFavorites({ limit: 8, offset: 0 });
      setFavorites(response.data);
    } catch (err: any) {
      console.error('Error loading favorites:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить избранное');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const loadViewHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await favoritesAPI.getViewHistory({ limit: 20, offset: 0 });
      setViewHistory(response.data);
    } catch (err: any) {
      console.error('Error loading view history:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить историю');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await usersAPI.updateCurrentUser(editedProfile);
      setProfile({ ...profile, ...editedProfile } as UserProfile);
      setIsEditingProfile(false);
      setSuccess('Профиль успешно обновлён');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.detail || 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const response = await uploadAPI.uploadImage(file);
      const avatarUrl = response.data.url;
      await usersAPI.updateCurrentUser({ avatar: avatarUrl });
      setProfile({ ...profile, avatar: avatarUrl } as UserProfile);
      setEditedProfile({ ...editedProfile, avatar: avatarUrl });
      setSuccess('Аватар успешно обновлён');
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить аватар');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleTopup = async () => {
    try {
      const amount = parseFloat(topupAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Введите корректную сумму');
        return;
      }
      setLoading(true);
      await walletAPI.topup(amount);
      setTopupDialogOpen(false);
      setTopupAmount('');
      setSuccess('Кошелёк успешно пополнен');
      loadWallet();
    } catch (err: any) {
      console.error('Error topping up wallet:', err);
      setError(err.response?.data?.detail || 'Не удалось пополнить кошелёк');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Введите корректную сумму');
        return;
      }
      if (amount > walletBalance) {
        setError('Недостаточно средств');
        return;
      }
      setLoading(true);
      await walletAPI.withdraw({ amount });
      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      setSuccess('Средства успешно выведены');
      loadWallet();
    } catch (err: any) {
      console.error('Error withdrawing from wallet:', err);
      setError(err.response?.data?.detail || 'Не удалось вывести средства');
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !profile) {
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
        <Typography color="text.primary">Профиль</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Мой профиль
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление личной информацией, заказами и настройками
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
          <Tab icon={<Person />} iconPosition="start" label="Мой профиль" />
          <Tab icon={<ShoppingBag />} iconPosition="start" label="Заказы" />
          <Tab icon={<AccountBalanceWallet />} iconPosition="start" label="Кошелёк" />
          <Tab icon={<Favorite />} iconPosition="start" label="Избранное" />
          <Tab icon={<History />} iconPosition="start" label="История" />
        </Tabs>
      </Paper>

      {/* Tab 1: Profile */}
      <TabPanel value={currentTab} index={0}>
        {profile && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src={profile.avatar}
                    sx={{ width: 150, height: 150, mx: 'auto' }}
                  >
                    {profile.full_name?.charAt(0)?.toUpperCase() || profile.email.charAt(0).toUpperCase()}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? <CircularProgress size={20} /> : <CloudUpload />}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </IconButton>
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {profile.full_name || 'Не указано'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profile.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Участник с {formatDate(profile.created_at)}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Личная информация
                  </Typography>
                  {!isEditingProfile ? (
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Редактировать
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<Save />}
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        Сохранить
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditedProfile(profile);
                        }}
                        disabled={loading}
                      >
                        Отмена
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Полное имя"
                      value={editedProfile.full_name || ''}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, full_name: e.target.value })
                      }
                      disabled={!isEditingProfile}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={editedProfile.email || ''}
                      disabled
                      helperText="Email нельзя изменить"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Телефон"
                      value={editedProfile.phone || ''}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, phone: e.target.value })
                      }
                      disabled={!isEditingProfile}
                      placeholder="+996 XXX XXX XXX"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Tab 2: Orders */}
      <TabPanel value={currentTab} index={1}>
        {ordersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              У вас пока нет заказов
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
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
      </TabPanel>

      {/* Tab 3: Wallet */}
      <TabPanel value={currentTab} index={2}>
        {walletLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Текущий баланс
                    </Typography>
                    <Typography variant="h3" fontWeight={600} color="primary">
                      {walletBalance.toFixed(2)} ₽
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        fullWidth
                        onClick={() => setTopupDialogOpen(true)}
                      >
                        Пополнить
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Remove />}
                        fullWidth
                        onClick={() => setWithdrawDialogOpen(true)}
                      >
                        Вывести
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>
                  История транзакций
                </Typography>
              </Box>
              {transactions.length === 0 ? (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <AccountBalanceWallet sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Нет транзакций
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell align="right">Сумма</TableCell>
                        <TableCell>Статус</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.type}
                              size="small"
                              color={transaction.type === 'topup' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                transaction.type === 'topup'
                                  ? 'success.main'
                                  : 'error.main',
                              fontWeight: 600,
                            }}
                          >
                            {transaction.type === 'topup' ? '+' : '-'}
                            {transaction.amount.toFixed(2)} ₽
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status}
                              size="small"
                              color={
                                transaction.status === 'completed'
                                  ? 'success'
                                  : transaction.status === 'pending'
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}
      </TabPanel>

      {/* Tab 4: Favorites */}
      <TabPanel value={currentTab} index={3}>
        {favoritesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : favorites.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <FavoriteBorder sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Нет избранных товаров
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
            >
              Смотреть товары
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {favorites.slice(0, 8).map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : 'https://via.placeholder.com/200'
                      }
                      alt={product.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.title}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                        {product.discount_price || product.price} сом
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/favorites')}
              >
                Посмотреть все ({favorites.length})
              </Button>
            </Box>
          </>
        )}
      </TabPanel>

      {/* Tab 5: View History */}
      <TabPanel value={currentTab} index={4}>
        {historyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : viewHistory.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <History sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              История просмотров пуста
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
            >
              Смотреть товары
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {viewHistory.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                  }}
                  onClick={() => navigate(`/products/${item.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      item.images && item.images.length > 0
                        ? item.images[0]
                        : 'https://via.placeholder.com/200'
                    }
                    alt={item.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                      {item.discount_price || item.price} сом
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Просмотрено: {formatDate(item.viewed_at)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Topup Dialog */}
      <Dialog open={topupDialogOpen} onClose={() => setTopupDialogOpen(false)}>
        <DialogTitle>Пополнить кошелёк</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Сумма (₽)"
            type="number"
            fullWidth
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopupDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleTopup} variant="contained" disabled={loading}>
            Пополнить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)}>
        <DialogTitle>Вывести средства</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Доступно: {walletBalance.toFixed(2)} ₽
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Сумма (₽)"
            type="number"
            fullWidth
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleWithdraw} variant="contained" disabled={loading}>
            Вывести
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error messages */}
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

export default ProfilePage;
