import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import BackButton from '../../components/profile/BackButton';
import { walletAPI } from '../../services/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

const WalletSubPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [mainBalance, setMainBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mbankPhone, setMbankPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(20, 0),
      ]);
      const balanceData = balanceRes.data;
      setMainBalance(balanceData.main_balance ?? balanceData.balance ?? 0);
      setReferralBalance(balanceData.referral_balance ?? 0);

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

      // Check if there's a return URL to redirect back
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        setTimeout(() => {
          navigate(returnUrl);
        }, 1500); // Wait a bit to show success message
      }
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

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <BackButton title="Кошелек" />

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
                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
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
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={() => setTopupDialogOpen(true)}
                  >
                    Пополнить
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Нельзя вывести. Используется для поднятия товаров
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WalletIcon sx={{ mr: 1, color: 'success.main' }} />
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
                      startIcon={<SwapHorizIcon />}
                      fullWidth
                      onClick={() => setTransferDialogOpen(true)}
                    >
                      Перевести
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<RemoveIcon />}
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
                <WalletIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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
            placeholder="0555 00 00 00"
          />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleTransfer} variant="contained" disabled={loading}>
            Перевести
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
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

export default WalletSubPage;
