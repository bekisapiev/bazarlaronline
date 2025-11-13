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
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { walletAPI } from '../services/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_type: string;
  description: string;
  status: string;
  reference_id?: string;
  created_at: string;
}

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadTransactions();
  }, [isAuthenticated, navigate, page, rowsPerPage, typeFilter, balanceFilter, statusFilter, dateFrom, dateTo]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      };

      if (typeFilter) params.type = typeFilter;
      if (balanceFilter) params.balance_type = balanceFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await walletAPI.getTransactions(params);

      // Handle different response formats
      let transactionsData: Transaction[] = [];
      if (Array.isArray(response.data)) {
        transactionsData = response.data;
        setTotalCount(response.data.length);
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        transactionsData = response.data.items;
        setTotalCount(response.data.total || response.data.items.length);
      } else if (response.data?.transactions && Array.isArray(response.data.transactions)) {
        transactionsData = response.data.transactions;
        setTotalCount(response.data.total || response.data.transactions.length);
      }

      setTransactions(transactionsData);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки транзакций');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      if (balanceFilter) params.balance_type = balanceFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await walletAPI.exportTransactions(params);

      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка экспорта данных');
    }
  };

  const handleReset = () => {
    setTypeFilter('');
    setBalanceFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      topup: 'Пополнение',
      withdrawal: 'Вывод',
      purchase: 'Покупка',
      referral: 'Реферал',
      promotion: 'Поднятие',
      transfer: 'Перевод',
      refund: 'Возврат',
    };
    return types[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    if (['topup', 'referral', 'refund', 'transfer'].includes(type)) return 'success';
    if (['withdrawal', 'purchase', 'promotion'].includes(type)) return 'error';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      completed: 'Завершено',
      pending: 'Ожидает',
      failed: 'Отменено',
      processing: 'Обработка',
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    if (status === 'completed') return 'success';
    if (status === 'pending' || status === 'processing') return 'warning';
    if (status === 'failed') return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          История транзакций
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Полная история финансовых операций
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Фильтры
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Обновить">
              <IconButton onClick={() => loadTransactions()} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<ExportIcon />}
              onClick={handleExport}
              variant="outlined"
              size="small"
            >
              Экспорт в Excel
            </Button>
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Тип операции</InputLabel>
            <Select
              value={typeFilter}
              label="Тип операции"
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="topup">Пополнение</MenuItem>
              <MenuItem value="withdrawal">Вывод</MenuItem>
              <MenuItem value="purchase">Покупка</MenuItem>
              <MenuItem value="referral">Реферал</MenuItem>
              <MenuItem value="promotion">Поднятие</MenuItem>
              <MenuItem value="transfer">Перевод</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Баланс</InputLabel>
            <Select
              value={balanceFilter}
              label="Баланс"
              onChange={(e) => {
                setBalanceFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="main">Основной</MenuItem>
              <MenuItem value="referral">Реферальный</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              label="Статус"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="completed">Завершено</MenuItem>
              <MenuItem value="pending">Ожидает</MenuItem>
              <MenuItem value="processing">Обработка</MenuItem>
              <MenuItem value="failed">Отменено</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Дата от"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            label="Дата до"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <Button
            variant="outlined"
            onClick={handleReset}
            size="small"
            sx={{ minWidth: 100 }}
          >
            Сбросить
          </Button>
        </Stack>
      </Paper>

      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Баланс</TableCell>
                <TableCell align="right">Сумма</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(transactions) || transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      Транзакции не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                Array.isArray(transactions) && transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTransactionTypeLabel(transaction.type)}
                        color={getTransactionTypeColor(transaction.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                      {transaction.reference_id && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {transaction.reference_id.slice(0, 8)}...
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.balance_type === 'main' ? 'Основной' : 'Реферальный'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color={
                          ['topup', 'referral', 'refund'].includes(transaction.type)
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        {['topup', 'referral', 'refund'].includes(transaction.type) ? '+' : '-'}
                        {transaction.amount.toFixed(2)} KGS
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(transaction.status)}
                        color={getStatusColor(transaction.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </Paper>
    </Container>
  );
};

export default TransactionsPage;
