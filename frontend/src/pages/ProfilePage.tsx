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
  ToggleButtonGroup,
  ToggleButton,
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
  Storefront,
  ShoppingCart,
  Receipt,
  SwapHoriz,
  AccountBalance,
  ContentCopy,
  Handshake,
  Upgrade,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  usersAPI,
  ordersAPI,
  walletAPI,
  uploadAPI,
  productsAPI,
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
  banner?: string;
  created_at: string;
  tariff?: string;
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

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images: string[];
  status: string;
  created_at: string;
  views?: number;
  referral_commission_amount?: number;
  referral_commission_percent?: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // Helper function to format error messages
  const formatErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;

    // Handle Pydantic validation errors
    if (Array.isArray(err)) {
      return err.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
    }

    // Handle object errors
    if (err && typeof err === 'object') {
      if (err.msg) return err.msg;
      if (err.message) return err.message;
      return JSON.stringify(err);
    }

    return 'Произошла ошибка';
  };

  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile tab state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Orders tab state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wallet tab state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mbankPhone, setMbankPhone] = useState('');

  // My Products tab state
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Partner Products tab state
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([]);
  const [partnerProductsLoading, setPartnerProductsLoading] = useState(false);

  // Orders subtab state
  const [ordersTab, setOrdersTab] = useState<'my_orders' | 'ordered_from_me'>('my_orders');
  const [orderedFromMe, setOrderedFromMe] = useState<Order[]>([]);

  // Wallet balances
  const [mainBalance, setMainBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');

  // Referral program state
  const [referralLink, setReferralLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<any>(null);

  useEffect(() => {
    loadProfile();
    loadReferralData();
  }, []);

  useEffect(() => {
    if (currentTab === 1 && myProducts.length === 0) {
      loadMyProducts();
    } else if (currentTab === 2 && orders.length === 0) {
      loadOrders();
      loadOrderedFromMe();
    } else if (currentTab === 3 && transactions.length === 0) {
      loadWallet();
    } else if (currentTab === 4 && partnerProducts.length === 0) {
      loadPartnerProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, myProducts.length, orders.length, transactions.length, partnerProducts.length]);

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
      // Handle both array and object with items
      const ordersData = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setOrders(ordersData);
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
        walletAPI.getTransactions(20, 0),
      ]);
      // Set dual balances: main and referral
      const balanceData = balanceRes.data;
      setMainBalance(Number(balanceData.main_balance ?? balanceData.balance ?? 0));
      setReferralBalance(Number(balanceData.referral_balance ?? 0));

      // Handle both array and object with items
      const transactionsData = Array.isArray(transactionsRes.data)
        ? transactionsRes.data
        : (transactionsRes.data.items || []);
      setTransactions(transactionsData);
    } catch (err: any) {
      console.error('Error loading wallet:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить кошелёк');
    } finally {
      setWalletLoading(false);
    }
  };

  const loadMyProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productsAPI.getMyProducts({
        limit: 20,
        offset: 0,
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setMyProducts(productsData);
    } catch (err: any) {
      console.error('Error loading my products:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить товары');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOrderedFromMe = async () => {
    try {
      const response = await ordersAPI.getOrders({ type: 'seller' });
      const ordersData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setOrderedFromMe(ordersData);
    } catch (err: any) {
      console.error('Error loading seller orders:', err);
    }
  };

  const loadPartnerProducts = async () => {
    try {
      setPartnerProductsLoading(true);
      const response = await productsAPI.getProducts({
        has_referral: true,
        limit: 50,
        offset: 0,
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setPartnerProducts(productsData);
    } catch (err: any) {
      console.error('Error loading partner products:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить партнерские товары');
    } finally {
      setPartnerProductsLoading(false);
    }
  };

  const loadReferralData = async () => {
    try {
      const [linkRes, statsRes] = await Promise.all([
        usersAPI.getReferralLink(),
        usersAPI.getReferralStats(),
      ]);
      setReferralLink(linkRes.data.referral_link);
      setReferralCode(linkRes.data.referral_code);
      setReferralStats(statsRes.data);
    } catch (err: any) {
      console.error('Error loading referral data:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Explicitly include phone field in the update
      const updateData = {
        full_name: editedProfile.full_name,
        phone: editedProfile.phone || null,
      };
      await usersAPI.updateCurrentUser(updateData);
      const updatedProfile = { ...profile, ...updateData } as UserProfile;
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
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

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const response = await uploadAPI.uploadImage(file);
      const bannerUrl = response.data.url;
      await usersAPI.updateCurrentUser({ banner: bannerUrl });
      setProfile({ ...profile, banner: bannerUrl } as UserProfile);
      setEditedProfile({ ...editedProfile, banner: bannerUrl });
      setSuccess('Баннер успешно обновлён');
    } catch (err: any) {
      console.error('Error uploading banner:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить баннер');
    } finally {
      setUploadingBanner(false);
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
      if (amount < 1000) {
        setError('Минимальная сумма вывода — 1000 сом');
        return;
      }
      if (amount > referralBalance) {
        setError('Недостаточно средств на реферальном балансе');
        return;
      }
      if (!mbankPhone) {
        setError('Введите номер телефона MBank');
        return;
      }
      setLoading(true);
      await walletAPI.withdraw({ amount, mbank_phone: mbankPhone });
      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      setMbankPhone('');
      setSuccess('Заявка на вывод средств создана');
      loadWallet();
    } catch (err: any) {
      console.error('Error withdrawing from wallet:', err);
      setError(err.response?.data?.detail || 'Не удалось вывести средства');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Введите корректную сумму');
        return;
      }
      if (amount > referralBalance) {
        setError('Недостаточно средств на реферальном балансе');
        return;
      }
      setLoading(true);
      await walletAPI.transfer({ amount, from: 'referral', to: 'main' });
      setTransferDialogOpen(false);
      setTransferAmount('');
      setSuccess('Средства успешно переведены на основной баланс');
      loadWallet();
    } catch (err: any) {
      console.error('Error transferring funds:', err);
      setError(err.response?.data?.detail || 'Не удалось перевести средства');
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

      {/* Quick Links */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Favorite />}
          onClick={() => navigate('/favorites')}
        >
          Избранное
        </Button>
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={() => navigate('/history')}
        >
          История просмотров
        </Button>
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
          <Tab icon={<Storefront />} iconPosition="start" label="Мои товары и услуги" />
          <Tab icon={<ShoppingBag />} iconPosition="start" label="Заказы" />
          <Tab icon={<AccountBalanceWallet />} iconPosition="start" label="Кошелёк" />
          <Tab icon={<Handshake />} iconPosition="start" label="Партнерские товары" />
        </Tabs>
      </Paper>

      {/* Tab 1: Profile */}
      <TabPanel value={currentTab} index={0}>
        {profile && (
          <Grid container spacing={3}>
            {/* Banner Section */}
            <Grid item xs={12}>
              <Paper sx={{ position: 'relative', height: 200, overflow: 'hidden', mb: 2 }}>
                {profile.banner ? (
                  <Box
                    component="img"
                    src={profile.banner}
                    alt="Profile Banner"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Нет баннера профиля
                    </Typography>
                  </Box>
                )}
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' },
                  }}
                  disabled={uploadingBanner}
                >
                  {uploadingBanner ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleBannerUpload}
                  />
                </IconButton>
              </Paper>
            </Grid>

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

            {/* Tariff Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Тарифный план
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Upgrade />}
                    onClick={() => navigate('/tariffs')}
                  >
                    Управление тарифами
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Текущий тариф:
                  </Typography>
                  <Chip label={profile?.tariff?.toUpperCase() || 'FREE'} size="small" color="primary" />
                </Box>
              </Paper>
            </Grid>

            {/* Referral Program Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Партнерская программа
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Приглашайте друзей и получайте 20% от их пополнений на реферальный баланс
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ваша партнерская ссылка"
                      value={referralLink}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <IconButton
                            onClick={() => {
                              navigator.clipboard.writeText(referralLink);
                              setSuccess('Ссылка скопирована в буфер обмена');
                            }}
                          >
                            <ContentCopy />
                          </IconButton>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Ваш реферальный код"
                      value={referralCode}
                      sx={{ mt: 2 }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>

                  {referralStats && (
                    <Grid item xs={12} md={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">
                                Всего рефералов
                              </Typography>
                              <Typography variant="h4" fontWeight={600}>
                                {referralStats.total_referrals || 0}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">
                                Активных
                              </Typography>
                              <Typography variant="h4" fontWeight={600} color="success.main">
                                {referralStats.active_referrals || 0}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">
                                Всего заработано
                              </Typography>
                              <Typography variant="h4" fontWeight={600} color="primary">
                                {Number(referralStats.total_earned || 0).toFixed(2)} сом
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Tab 1: My Products */}
      <TabPanel value={currentTab} index={1}>
        {productsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : myProducts.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Storefront sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              У вас пока нет товаров и услуг
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/add')}
            >
              Добавить товар или услугу
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {myProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
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
                        mb: 1,
                      }}
                    >
                      {product.title}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {product.discount_price || product.price} сом
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Chip
                        label={product.status === 'active' ? 'Активен' : product.status === 'moderation' ? 'На модерации' : 'Неактивен'}
                        color={product.status === 'active' ? 'success' : product.status === 'moderation' ? 'warning' : 'default'}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Просмотры: {product.views || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        Посмотреть
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Tab 2: Orders */}
      <TabPanel value={currentTab} index={2}>
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={ordersTab}
            exclusive
            onChange={(_, value) => {
              if (value !== null) {
                setOrdersTab(value);
              }
            }}
            aria-label="orders type"
          >
            <ToggleButton value="my_orders" aria-label="my orders">
              <ShoppingCart sx={{ mr: 1 }} />
              Мои заказы
            </ToggleButton>
            <ToggleButton value="ordered_from_me" aria-label="ordered from me">
              <Receipt sx={{ mr: 1 }} />
              Мне заказали
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {ordersTab === 'my_orders' ? (
          ordersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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
          )
        ) : (
          ordersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : orderedFromMe.length === 0 ? (
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
          )
        )}
      </TabPanel>

      {/* Tab 3: Wallet */}
      <TabPanel value={currentTab} index={3}>
        {walletLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Основной баланс
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Для оплаты услуг платформы
                    </Typography>
                    <Typography variant="h3" fontWeight={600} color="primary" sx={{ my: 2 }}>
                      {Number(mainBalance ?? 0).toFixed(2)} сом
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      fullWidth
                      onClick={() => setTopupDialogOpen(true)}
                    >
                      Пополнить
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Нельзя вывести. Используется для поднятия товаров, автоподнятия и реферальных выплат
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccountBalanceWallet sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Реферальный баланс
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Можно вывести или перевести
                    </Typography>
                    <Typography variant="h3" fontWeight={600} color="success.main" sx={{ my: 2 }}>
                      {Number(referralBalance ?? 0).toFixed(2)} сом
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<SwapHoriz />}
                        fullWidth
                        onClick={() => setTransferDialogOpen(true)}
                      >
                        Перевести
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
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
                            {Number(transaction.amount ?? 0).toFixed(2)} сом
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

      {/* Tab 4: Partner Products */}
      <TabPanel value={currentTab} index={4}>
        {partnerProductsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : partnerProducts.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Handshake sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Нет товаров с партнерской программой
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Товары с партнерской программой позволяют вам зарабатывать, делясь ссылками на них
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/')}
            >
              Смотреть все товары
            </Button>
          </Paper>
        ) : (
          <Box>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.50' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                💰 Как зарабатывать?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                1. Выберите товар с партнерской программой из списка ниже
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                2. Скопируйте партнерскую ссылку на странице товара
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                3. Поделитесь ссылкой с друзьями или на своих платформах
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4. Получайте комиссию за каждую покупку по вашей ссылке на реферальный баланс
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {partnerProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                      position: 'relative',
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.discount_price && (
                      <Chip
                        label="Скидка"
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                        }}
                      />
                    )}
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
                          mb: 1,
                        }}
                      >
                        {product.title}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                        {product.discount_price || product.price} сом
                      </Typography>

                      {/* Referral Commission Info */}
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ваша комиссия:
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={600} color="success.main">
                          {product.referral_commission_amount || 0} сом ({product.referral_commission_percent || 0}%)
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product.id}`);
                        }}
                      >
                        Получить ссылку
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </TabPanel>

      {/* Topup Dialog */}
      <Dialog open={topupDialogOpen} onClose={() => setTopupDialogOpen(false)}>
        <DialogTitle>Пополнить кошелёк</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Сумма (сом)"
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
        <DialogTitle>Вывести средства на MBank</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Доступно на реферальном балансе: {Number(referralBalance ?? 0).toFixed(2)} сом
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Сумма (сом)"
            type="number"
            fullWidth
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Минимальная сумма вывода: 1000 сом"
          />
          <TextField
            margin="dense"
            label="Номер телефона MBank"
            type="tel"
            fullWidth
            value={mbankPhone}
            onChange={(e) => setMbankPhone(e.target.value)}
            placeholder="+996555123456"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Средства будут переведены на указанный номер телефона MBank
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleWithdraw} variant="contained" color="success" disabled={loading}>
            Вывести
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)}>
        <DialogTitle>Перевести на основной баланс</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Доступно на реферальном балансе: {Number(referralBalance ?? 0).toFixed(2)} сом
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Сумма (сом)"
            type="number"
            fullWidth
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Средства будут переведены на основной баланс для оплаты услуг платформы
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleTransfer} variant="contained" disabled={loading}>
            Перевести
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
          {formatErrorMessage(error)}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
