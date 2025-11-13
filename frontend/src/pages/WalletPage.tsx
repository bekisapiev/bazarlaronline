import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as TransferIcon,
  History as HistoryIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { walletAPI } from '../services/api';

interface Wallet {
  main_balance: number;
  referral_balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_type: string;
  description: string;
  status: string;
  created_at: string;
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialogs
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Form fields
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawName, setWithdrawName] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWalletData();
    loadRecentTransactions();
  }, [isAuthenticated, navigate]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await walletAPI.getBalance();
      setWallet(response.data);
    } catch (err: any) {
      console.error('Error loading wallet:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки кошелька');
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await walletAPI.getTransactions({ limit: 5, offset: 0 });
      // Handle different response formats
      let transactionsData: Transaction[] = [];
      if (Array.isArray(response.data)) {
        transactionsData = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        transactionsData = response.data.items;
      } else if (response.data?.transactions && Array.isArray(response.data.transactions)) {
        transactionsData = response.data.transactions;
      }
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setTransactions([]);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount < 100) {
      setError('Минимальная сумма пополнения: 100 сом');
      return;
    }
    if (amount > 100000) {
      setError('Максимальная сумма пополнения: 100,000 сом');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await walletAPI.topup(amount);

      if (response.data.payment_url) {
        // Redirect to payment gateway
        window.location.href = response.data.payment_url;
      } else {
        setSuccessMessage('Запрос на пополнение создан');
        setTopUpDialogOpen(false);
        setTopUpAmount('');
        loadWalletData();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания запроса на пополнение');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 3000) {
      setError('Минимальная сумма вывода: 3,000 сом');
      return;
    }
    if (!wallet || amount > wallet.referral_balance) {
      setError('Недостаточно средств на реферальном балансе');
      return;
    }
    if (!withdrawAccount || !withdrawName) {
      setError('Заполните все поля');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await walletAPI.withdraw({
        amount,
        method: 'mbank',
        account_number: withdrawAccount,
        account_name: withdrawName,
      });

      setSuccessMessage('Заявка на вывод средств создана. Ожидайте обработки.');
      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      setWithdrawAccount('');
      setWithdrawName('');
      loadWalletData();
      loadRecentTransactions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания заявки на вывод');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }
    if (!wallet || amount > wallet.referral_balance) {
      setError('Недостаточно средств на реферальном балансе');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await walletAPI.transfer({
        from: 'referral',
        to: 'main',
        amount,
      });

      setSuccessMessage('Средства успешно переведены на основной баланс');
      setTransferDialogOpen(false);
      setTransferAmount('');
      loadWalletData();
      loadRecentTransactions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка перевода средств');
    } finally {
      setSubmitting(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      topup: 'Пополнение',
      withdrawal: 'Вывод',
      purchase: 'Покупка',
      referral: 'Реферал',
      promotion: 'Поднятие',
      transfer: 'Перевод',
    };
    return types[type] || type;
  };

  const getTransactionColor = (type: string) => {
    if (['topup', 'referral', 'transfer'].includes(type)) return 'success';
    if (['withdrawal', 'purchase', 'promotion'].includes(type)) return 'error';
    return 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Мой кошелек
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление балансами и финансовыми операциями
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Main Balance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="white">
                  Основной баланс
                </Typography>
                <Tooltip title="Используется для внутренних платежей (покупки, поднятия объявлений)">
                  <IconButton size="small" sx={{ color: 'white' }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="h3" fontWeight={700} color="white" sx={{ mb: 2 }}>
                {wallet?.main_balance.toFixed(2) || '0.00'} {wallet?.currency || 'KGS'}
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTopUpDialogOpen(true)}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
                fullWidth
              >
                Пополнить
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Referral Balance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="white">
                  Реферальный баланс
                </Typography>
                <Tooltip title="Можно выводить на банковский счет (мин. 3000 сом)">
                  <IconButton size="small" sx={{ color: 'white' }}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="h3" fontWeight={700} color="white" sx={{ mb: 2 }}>
                {wallet?.referral_balance.toFixed(2) || '0.00'} {wallet?.currency || 'KGS'}
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<RemoveIcon />}
                    onClick={() => setWithdrawDialogOpen(true)}
                    disabled={!wallet || wallet.referral_balance < 3000}
                    sx={{
                      bgcolor: 'white',
                      color: '#f5576c',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    }}
                    fullWidth
                  >
                    Вывести
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<TransferIcon />}
                    onClick={() => setTransferDialogOpen(true)}
                    disabled={!wallet || wallet.referral_balance <= 0}
                    sx={{
                      bgcolor: 'white',
                      color: '#f5576c',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    }}
                    fullWidth
                  >
                    Перевести
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Последние транзакции
          </Typography>
          <Button
            endIcon={<HistoryIcon />}
            onClick={() => navigate('/transactions')}
          >
            Все транзакции
          </Button>
        </Box>

        {Array.isArray(transactions) && transactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Нет транзакций
            </Typography>
          </Box>
        ) : (
          <List>
            {Array.isArray(transactions) && transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={500}>
                          {getTransactionTypeLabel(transaction.type)}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          color={transaction.type === 'topup' || transaction.type === 'referral' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'topup' || transaction.type === 'referral' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} {wallet?.currency}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={transaction.balance_type === 'main' ? 'Основной' : 'Реферальный'}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.created_at).toLocaleDateString('ru-RU')}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < transactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Top Up Dialog */}
      <Dialog open={topUpDialogOpen} onClose={() => !submitting && setTopUpDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Пополнить основной баланс</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Минимальная сумма: 100 сом, максимальная: 100,000 сом
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Сумма (сом)"
            type="number"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            disabled={submitting}
            inputProps={{ min: 100, max: 100000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopUpDialogOpen(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleTopUp} variant="contained" disabled={submitting}>
            {submitting ? 'Обработка...' : 'Пополнить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onClose={() => !submitting && setWithdrawDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Вывести средства</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Минимальная сумма вывода: 3,000 сом. Средства будут переведены на Мбанк.
          </Typography>
          <TextField
            fullWidth
            label="Сумма (сом)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
            inputProps={{ min: 3000 }}
          />
          <TextField
            fullWidth
            label="Номер Мбанк"
            value={withdrawAccount}
            onChange={(e) => setWithdrawAccount(e.target.value)}
            disabled={submitting}
            placeholder="+996..."
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Имя владельца счета"
            value={withdrawName}
            onChange={(e) => setWithdrawName(e.target.value)}
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleWithdraw} variant="contained" disabled={submitting}>
            {submitting ? 'Обработка...' : 'Создать заявку'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => !submitting && setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Перевести на основной баланс</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Переведите средства с реферального баланса на основной для использования внутри платформы.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Сумма (сом)"
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            disabled={submitting}
            inputProps={{ min: 1, max: wallet?.referral_balance }}
            helperText={`Доступно: ${wallet?.referral_balance.toFixed(2)} ${wallet?.currency}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleTransfer} variant="contained" disabled={submitting}>
            {submitting ? 'Обработка...' : 'Перевести'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WalletPage;
