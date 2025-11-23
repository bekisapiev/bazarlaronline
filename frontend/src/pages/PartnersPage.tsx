import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  AccountBalance as WalletIcon,
  WhatsApp,
  Telegram,
  Facebook,
  Twitter,
  Instagram,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';

interface PartnerStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  month_earnings: number;
  pending_earnings: number;
  available_withdrawal: number;
}

interface Referral {
  id: string;
  full_name: string;
  registration_date: string;
  total_purchases: number;
  your_earnings: number;
  status: 'active' | 'inactive';
}

interface EarningsRecord {
  id: string;
  date: string;
  order_id: string;
  referral_name: string;
  order_amount: number;
  your_earnings: number;
  status: 'pending' | 'paid';
}

const PartnersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [earnings, setEarnings] = useState<EarningsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const referralLink = user?.referral_id
    ? `${window.location.origin}/register?ref=${user.referral_id}`
    : '';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPartnerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const loadPartnerData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load partner statistics
      const statsResponse = await api.get('/partners/stats');
      setStats(statsResponse.data);

      // Load referrals list
      const referralsResponse = await api.get('/partners/referrals');
      const referralsData = Array.isArray(referralsResponse.data)
        ? referralsResponse.data
        : (referralsResponse.data.items || []);
      setReferrals(referralsData);

      // Load earnings history
      const earningsResponse = await api.get('/partners/earnings');
      const earningsData = Array.isArray(earningsResponse.data)
        ? earningsResponse.data
        : (earningsResponse.data.items || []);
      setEarnings(earningsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setSuccess('Ссылка скопирована в буфер обмена');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleShare = (platform: string) => {
    const text = encodeURIComponent('Присоединяйтесь к Bazarlar Online - лучшей торговой платформе Кыргызстана!');
    const url = encodeURIComponent(referralLink);

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      instagram: referralLink, // Instagram doesn't support direct sharing, just copy link
    };

    if (platform === 'instagram') {
      handleCopyLink();
      setSuccess('Ссылка скопирована. Вставьте её в Instagram био или пост');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <MuiLink component={Link} to="/my-profile" underline="hover" color="inherit">
          Профиль
        </MuiLink>
        <Typography color="text.primary">Партнерская программа</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Партнерская программа
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Приглашайте друзей и зарабатывайте на их покупках
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Всего рефералов
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {stats?.total_referrals || 0}
              </Typography>
              <Typography variant="caption" color="success.main">
                {stats?.active_referrals || 0} активных
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Всего заработано
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {stats?.total_earnings || 0} сом
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats?.month_earnings || 0} сом за месяц
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WalletIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Ожидает выплаты
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {stats?.pending_earnings || 0} сом
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WalletIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Доступно к выводу
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={600}>
                {stats?.available_withdrawal || 0} сом
              </Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
                component={Link}
                to="/my-profile"
                disabled={(stats?.available_withdrawal || 0) < 100}
              >
                Вывести
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Referral Link Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ваша реферальная ссылка
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Поделитесь этой ссылкой с друзьями и зарабатывайте 5% с каждой их покупки
        </Typography>

        <TextField
          fullWidth
          value={referralLink}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleCopyLink}>
                  <CopyIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<WhatsApp />}
            onClick={() => handleShare('whatsapp')}
            sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#20BD5A' } }}
          >
            WhatsApp
          </Button>
          <Button
            variant="contained"
            startIcon={<Telegram />}
            onClick={() => handleShare('telegram')}
            sx={{ bgcolor: '#0088cc', '&:hover': { bgcolor: '#0077b5' } }}
          >
            Telegram
          </Button>
          <Button
            variant="contained"
            startIcon={<Facebook />}
            onClick={() => handleShare('facebook')}
            sx={{ bgcolor: '#1877f2', '&:hover': { bgcolor: '#166fe5' } }}
          >
            Facebook
          </Button>
          <Button
            variant="contained"
            startIcon={<Twitter />}
            onClick={() => handleShare('twitter')}
            sx={{ bgcolor: '#1DA1F2', '&:hover': { bgcolor: '#1a91da' } }}
          >
            Twitter
          </Button>
          <Button
            variant="contained"
            startIcon={<Instagram />}
            onClick={() => handleShare('instagram')}
            sx={{
              background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
              '&:hover': { opacity: 0.9 },
            }}
          >
            Instagram
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Мои рефералы" />
          <Tab label="История заработка" />
          <Tab label="Как это работает" />
        </Tabs>
      </Paper>

      {/* Referrals Tab */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell align="center">Покупок</TableCell>
                <TableCell align="right">Ваш доход</TableCell>
                <TableCell align="center">Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {referrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      У вас пока нет рефералов
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.full_name}</TableCell>
                    <TableCell>
                      {new Date(referral.registration_date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell align="center">{referral.total_purchases}</TableCell>
                    <TableCell align="right">{referral.your_earnings} сом</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={referral.status === 'active' ? 'Активен' : 'Неактивен'}
                        color={referral.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Earnings Tab */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Реферал</TableCell>
                <TableCell>Заказ</TableCell>
                <TableCell align="right">Сумма заказа</TableCell>
                <TableCell align="right">Ваш доход</TableCell>
                <TableCell align="center">Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {earnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      История заработка пуста
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>{new Date(earning.date).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>{earning.referral_name}</TableCell>
                    <TableCell>#{earning.order_id}</TableCell>
                    <TableCell align="right">{earning.order_amount} сом</TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight={600}>
                        +{earning.your_earnings} сом
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={earning.status === 'paid' ? 'Выплачено' : 'Ожидает'}
                        color={earning.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* How it Works Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Как работает партнерская программа
          </Typography>

          <Stack spacing={3} sx={{ mt: 3 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                1. Пригласите друзей
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Поделитесь своей реферальной ссылкой с друзьями через WhatsApp, Telegram, Instagram или другие
                социальные сети. Когда они зарегистрируются по вашей ссылке, они станут вашими рефералами.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                2. Они покупают - вы зарабатываете
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Получайте 5% от каждой покупки ваших рефералов. Чем больше они покупают, тем больше вы
                зарабатываете. Доход начисляется автоматически после подтверждения заказа.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                3. Выводите деньги
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Минимальная сумма для вывода - 100 сом. Вы можете вывести деньги на свой кошелек или банковскую
                карту в любое время через раздел "Кошелек" в профиле.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Условия программы
              </Typography>
              <Stack component="ul" spacing={1} sx={{ pl: 2 }}>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Комиссия 5% начисляется с каждой покупки реферала
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Доход доступен к выводу через 7 дней после подтверждения заказа
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Минимальная сумма вывода - 100 сом
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Реферал считается активным в течение 12 месяцев после регистрации
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Запрещается использовать мошеннические схемы для накрутки рефералов
                  </Typography>
                </li>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      )}
    </Container>
  );
};

export default PartnersPage;
