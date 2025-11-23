import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Block,
  Pending,
  Payment,
  AccountBalance,
} from '@mui/icons-material';
import api from '../../services/api';

interface Withdrawal {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  amount: number;
  payment_method: string;
  payment_details: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_note?: string;
}

interface WithdrawalStats {
  total: number;
  pending: number;
  paid: number;
  rejected: number;
  totalAmount: number;
  pendingAmount: number;
}

const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<WithdrawalStats>({
    total: 0,
    pending: 0,
    paid: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Selected withdrawal
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  // Forms
  const [rejectMessage, setRejectMessage] = useState('');
  const [rejectTemplate, setRejectTemplate] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const rejectTemplates = [
    { value: '', label: 'Выберите шаблон' },
    { value: 'insufficient_info', label: 'Недостаточно информации' },
    { value: 'invalid_details', label: 'Неверные платежные данные' },
    { value: 'min_amount', label: 'Сумма ниже минимальной' },
    { value: 'fraud_suspected', label: 'Подозрение на мошенничество' },
    { value: 'custom', label: 'Свое сообщение' },
  ];

  const templateMessages: { [key: string]: string } = {
    insufficient_info:
      'Ваш запрос на вывод средств отклонен из-за недостаточной информации. Пожалуйста, предоставьте полные платежные данные.',
    invalid_details:
      'Указанные платежные данные некорректны. Проверьте правильность введенной информации и отправьте запрос снова.',
    min_amount:
      'Сумма вывода ниже минимально допустимой. Минимальная сумма для вывода составляет 1000 сом.',
    fraud_suspected:
      'Ваш запрос на вывод средств отклонен в связи с подозрением на мошенническую деятельность. Обратитесь в службу поддержки для разъяснений.',
  };

  useEffect(() => {
    loadWithdrawals();
    loadStats();
  }, [statusFilter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/withdrawals/admin/all', { params });
      setWithdrawals(response.data || []);
    } catch (err: any) {
      console.error('Error loading withdrawals:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить запросы на вывод');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/withdrawals/admin/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const handleOpenApprove = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setAdminNote('');
    setApproveDialogOpen(true);
  };

  const handleOpenReject = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectMessage('');
    setRejectTemplate('');
    setRejectDialogOpen(true);
  };

  const handleOpenCancel = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setCancelDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    try {
      setLoading(true);
      await api.put(`/withdrawals/admin/${selectedWithdrawal.id}/status`, {
        status: 'paid',
        admin_note: adminNote,
      });
      setSuccess('Статус изменен на "Выплачено"');
      setApproveDialogOpen(false);
      loadWithdrawals();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось изменить статус');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      setLoading(true);
      await api.put(`/withdrawals/admin/${selectedWithdrawal.id}/status`, {
        status: 'rejected',
        admin_note: rejectMessage,
      });

      // Send notification to user
      await api.post(`/users/admin/${selectedWithdrawal.user_id}/warning`, {
        message: rejectMessage,
      });

      setSuccess('Запрос отклонен, уведомление отправлено пользователю');
      setRejectDialogOpen(false);
      loadWithdrawals();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось отклонить запрос');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedWithdrawal) return;

    try {
      setLoading(true);
      await api.put(`/withdrawals/admin/${selectedWithdrawal.id}/status`, {
        status: 'cancelled',
      });
      setSuccess('Запрос отменен');
      setCancelDialogOpen(false);
      loadWithdrawals();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось отменить запрос');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (template: string) => {
    setRejectTemplate(template);
    if (template && template !== 'custom') {
      setRejectMessage(templateMessages[template] || '');
    } else {
      setRejectMessage('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusChip = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: any } } = {
      pending: { label: 'Ожидает', color: 'warning' },
      paid: { label: 'Выплачено', color: 'success' },
      rejected: { label: 'Отклонено', color: 'error' },
      cancelled: { label: 'Отменено', color: 'default' },
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      bank_card: 'Банковская карта',
      bank_account: 'Банковский счет',
      elsom: 'Elsom',
      mbankkg: 'MBank.kg',
      optima: 'Optima Bank',
    };
    return methods[method] || method;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Управление выводами средств
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Всего запросов
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AccountBalance />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ожидают
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {stats.pending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.pendingAmount} сом
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Pending />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Выплачено
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {stats.paid}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.totalAmount} сом
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Payment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Отклонено
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {stats.rejected}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Block />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Статус"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="pending">Ожидают</MenuItem>
              <MenuItem value="paid">Выплачено</MenuItem>
              <MenuItem value="rejected">Отклонено</MenuItem>
              <MenuItem value="cancelled">Отменено</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Withdrawals Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Способ вывода</TableCell>
              <TableCell>Платежные данные</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата запроса</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">Запросы не найдены</Typography>
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {withdrawal.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {withdrawal.user_email}
                      </Typography>
                      {withdrawal.user_phone && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {withdrawal.user_phone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={600}>
                      {withdrawal.amount} сом
                    </Typography>
                  </TableCell>
                  <TableCell>{getPaymentMethodLabel(withdrawal.payment_method)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                      {withdrawal.payment_details}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(withdrawal.status)}</TableCell>
                  <TableCell>{formatDate(withdrawal.created_at)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {withdrawal.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenApprove(withdrawal)}
                            title="Выплачено"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenReject(withdrawal)}
                            title="Отклонить"
                          >
                            <Block />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => handleOpenCancel(withdrawal)}
                            title="Отменить"
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                      {withdrawal.status !== 'pending' && (
                        <Typography variant="caption" color="text.secondary">
                          {withdrawal.admin_note || '—'}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Подтвердить выплату</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Пользователь: <strong>{selectedWithdrawal?.user_name}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Сумма: <strong>{selectedWithdrawal?.amount} сом</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Способ: <strong>{getPaymentMethodLabel(selectedWithdrawal?.payment_method || '')}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              Реквизиты: <strong>{selectedWithdrawal?.payment_details}</strong>
            </Typography>
          </Box>
          <TextField
            label="Примечание (необязательно)"
            multiline
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            fullWidth
            placeholder="Номер транзакции, дата перевода и т.д."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleApprove} variant="contained" color="success" disabled={loading}>
            Подтвердить выплату
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отклонить запрос</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Шаблон сообщения"
              value={rejectTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              fullWidth
            >
              {rejectTemplates.map((template) => (
                <MenuItem key={template.value} value={template.value}>
                  {template.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Сообщение пользователю"
              multiline
              rows={4}
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              fullWidth
              placeholder="Укажите причину отклонения"
              helperText="Это сообщение будет отправлено пользователю"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={loading || !rejectMessage}
          >
            Отклонить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Отменить запрос</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить запрос на вывод средств от пользователя{' '}
            {selectedWithdrawal?.user_name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Назад</Button>
          <Button onClick={handleCancel} variant="contained" disabled={loading}>
            Отменить запрос
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminWithdrawalsPage;
