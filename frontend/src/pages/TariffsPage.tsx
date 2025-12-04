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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usersAPI, walletAPI } from '../services/api';

interface TariffPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  boost_price: number;
  has_auto_boost: boolean;
  has_partner_program: boolean;
  color: string;
  icon: React.ReactNode;
}

const TARIFF_PLANS: TariffPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    duration: 0,
    boost_price: 20,
    has_auto_boost: false,
    has_partner_program: false,
    color: '#9e9e9e',
    icon: <StarIcon />,
    features: [
      'Размещение товаров и услуг',
      'Продвижение: 10-100 сом (500-5000 просмотров)',
      'Базовая поддержка',
      'Отображение в каталоге',
      'Реферальная программа: 5% кэшбек при пополнении',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2990,
    duration: 30,
    boost_price: 15,
    has_auto_boost: true,
    has_partner_program: false,
    color: '#2196f3',
    icon: <TrendingUpIcon />,
    features: [
      'Все возможности Free',
      'Скидка 33% на продвижение товаров',
      'Автопродвижение товаров',
      'Приоритет в поиске',
      'Расширенная статистика',
      'Реферальная программа: 5% кэшбек при пополнении',
      'Требуется баланс: 2,990 сом (не списывается)',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 29990,
    duration: 30,
    boost_price: 10,
    has_auto_boost: true,
    has_partner_program: true,
    color: '#ff9800',
    icon: <RocketIcon />,
    features: [
      'Все возможности Pro',
      'Скидка 50% на продвижение товаров',
      'Автопродвижение товаров',
      'Реферальная программа для товаров',
      'Настройка комиссии рефералов (1-50%)',
      'Партнер получает 45%, вы - 55%',
      'Максимальный приоритет',
      'Персональная поддержка',
      'Требуется баланс: 29,990 сом (не списывается)',
    ],
  },
];

const TariffsPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentTariff, setCurrentTariff] = useState<string>('free');
  const [tariffExpiresAt, setTariffExpiresAt] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<TariffPlan | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userResponse, balanceResponse] = await Promise.all([
        usersAPI.getCurrentUser(),
        walletAPI.getBalance(),
      ]);

      setCurrentTariff(userResponse.data.tariff || 'free');
      setTariffExpiresAt(userResponse.data.tariff_expires_at || null);
      setBalance(Number(balanceResponse.data.main_balance) || 0);
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError('Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTariff = async (tariff: TariffPlan) => {
    // Allow switching to Free (downgrade from paid plans)
    if (tariff.id === 'free' && currentTariff === 'free') {
      setError('Тариф Free уже активен');
      return;
    }

    // For paid tariffs, check balance
    if (tariff.id !== 'free' && balance < tariff.price) {
      setError(`Недостаточно средств. Необходимо: ${tariff.price} сом, доступно: ${Number(balance).toFixed(2)} сом`);
      return;
    }

    setSelectedTariff(tariff);
    setConfirmDialogOpen(true);
  };

  const confirmActivation = async () => {
    if (!selectedTariff) return;

    setActivating(true);
    setError(null);

    try {
      await usersAPI.activateTariff(selectedTariff.id);
      setSuccess(`Тариф ${selectedTariff.name} успешно активирован!`);
      setConfirmDialogOpen(false);
      loadUserData();
    } catch (err: any) {
      console.error('Error activating tariff:', err);
      setError(err.response?.data?.detail || 'Ошибка активации тарифа');
    } finally {
      setActivating(false);
    }
  };

  const getDaysRemaining = () => {
    if (!tariffExpiresAt) return null;

    const now = new Date();
    const expiresAt = new Date(tariffExpiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Тарифные планы
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Выберите тариф, который подходит для вашего бизнеса
        </Typography>

        {currentTariff !== 'free' && daysRemaining !== null && (
          <Chip
            label={`Текущий тариф: ${currentTariff.toUpperCase()} (осталось ${daysRemaining} дней)`}
            color="primary"
            sx={{ mt: 2 }}
          />
        )}

        <Paper sx={{ p: 2, mt: 3, maxWidth: 400, mx: 'auto', bgcolor: 'primary.50' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Баланс основного счета:
          </Typography>
          <Typography variant="h4" fontWeight={600} color="primary">
            {Number(balance).toFixed(2)} сом
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => navigate('/profile?tab=3')}
          >
            Пополнить баланс
          </Button>
        </Paper>
      </Box>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Tariff Cards */}
      <Grid container spacing={3}>
        {TARIFF_PLANS.map((tariff) => {
          const isCurrentTariff = currentTariff === tariff.id;
          const canActivate = balance >= tariff.price && !isCurrentTariff;

          return (
            <Grid item xs={12} md={4} key={tariff.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isCurrentTariff ? 3 : 1,
                  borderColor: isCurrentTariff ? tariff.color : 'divider',
                  transform: isCurrentTariff ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: isCurrentTariff ? 'scale(1.05)' : 'scale(1.02)',
                    boxShadow: 6,
                  },
                }}
              >
                {isCurrentTariff && (
                  <Chip
                    label="Активен"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: `${tariff.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ color: tariff.color, fontSize: 30 }}>
                      {tariff.icon}
                    </Box>
                  </Box>

                  {/* Name */}
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {tariff.name}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ mb: 3 }}>
                    {tariff.price === 0 ? (
                      <Typography variant="h5" fontWeight={600}>
                        Бесплатно
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {tariff.price.toLocaleString()} сом
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / {tariff.duration} дней
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* Features */}
                  <List dense>
                    {tariff.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon sx={{ color: tariff.color }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Action Button */}
                  <Button
                    variant={isCurrentTariff ? 'outlined' : 'contained'}
                    fullWidth
                    size="large"
                    disabled={isCurrentTariff || (tariff.id !== 'free' && !canActivate)}
                    onClick={() => handleActivateTariff(tariff)}
                    sx={{
                      mt: 3,
                      bgcolor: isCurrentTariff ? 'transparent' : tariff.color,
                      borderColor: tariff.color,
                      '&:hover': {
                        bgcolor: isCurrentTariff ? 'transparent' : tariff.color,
                      },
                    }}
                  >
                    {isCurrentTariff
                      ? 'Активен'
                      : tariff.id === 'free'
                      ? 'По умолчанию'
                      : canActivate
                      ? 'Активировать'
                      : 'Недостаточно средств'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Information Section */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Как работают тарифы?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                📌 Автоматическое продление
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Тарифы Pro и Business требуют минимальный баланс (2,990 и 29,990 сом соответственно), но баланс НЕ списывается.
                Каждый месяц система проверяет баланс: если средств достаточно - тариф продлевается еще на 30 дней,
                если недостаточно - вы переходите на тариф Free.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                🚀 Продвижение товаров
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Покупайте просмотры для товаров (10 сом - 500 просмотров, 100 сом - 5000 просмотров).
                Продвигаемые товары показываются несколько раз на главной странице для быстрого набора просмотров.
                PRO тариф: скидка 33%, BUSINESS: скидка 50%.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                ⚡ Автопродвижение
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                На тарифах Pro и Business доступно автоматическое продвижение товаров по расписанию.
                Баланс списывается за каждое продвижение согласно вашему тарифу.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                💰 Реферальная программа для пользователей
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Приглашайте друзей и получайте 5% кэшбек с каждого пополнения баланса вашими рефералами.
                Кэшбек начисляется пожизненно на ваш реферальный счет. Доступно на всех тарифах.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                🤝 Реферальная программа для товаров
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Только на тарифе Business. Устанавливайте процент комиссии (1-50%) для партнеров.
                После подтверждения заказа: партнер получает 45% комиссии, вы - 55%, платформа - 0%.
                Комиссия списывается с основного счета и начисляется на реферальный счет партнера.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Подтверждение активации тарифа</DialogTitle>
        <DialogContent>
          {selectedTariff && (
            <Box>
              <Typography variant="body1" paragraph>
                Вы уверены, что хотите активировать тариф <strong>{selectedTariff.name}</strong>?
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Для активации тарифа требуется минимальный баланс: <strong>{selectedTariff.price} сом</strong>
                </Typography>
                <Typography variant="body2">
                  <strong>Баланс НЕ списывается!</strong> Средства остаются на счету.
                </Typography>
                <Typography variant="body2">
                  Тариф будет активен в течение <strong>{selectedTariff.duration} дней</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Ваш текущий баланс: <strong>{balance.toFixed(2)} сом</strong>
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={activating}>
            Отмена
          </Button>
          <Button
            onClick={confirmActivation}
            variant="contained"
            disabled={activating}
          >
            {activating ? <CircularProgress size={24} /> : 'Подтвердить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TariffsPage;
