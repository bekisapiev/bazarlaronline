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
  Tabs,
  Tab,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Delete,
  Block,
  CheckCircle,
  Warning,
  Visibility,
  Search,
  People,
  PersonAdd,
  PersonOff,
} from '@mui/icons-material';
import api from '../../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  is_banned: boolean;
  role: string;
  tariff?: string;
  created_at: string;
}

interface UserStats {
  total: number;
  active: number;
  banned: number;
  newThisMonth: number;
}

interface UserOrder {
  id: string;
  product_title: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface UserProduct {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
}

interface UserTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface UserDetails {
  orders: UserOrder[];
  products: UserProduct[];
  wallet: {
    main_balance: number;
    referral_balance: number;
  };
  transactions: UserTransaction[];
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, banned: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Selected user
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [detailsTab, setDetailsTab] = useState(0);

  // Edit form
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'user',
    tariff: 'free',
  });

  // Warning form
  const [warningMessage, setWarningMessage] = useState('');
  const [warningTemplate, setWarningTemplate] = useState('');

  // Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const warningTemplates = [
    { value: '', label: 'Выберите шаблон' },
    { value: 'spam', label: 'Предупреждение за спам' },
    { value: 'inappropriate', label: 'Неподобающее поведение' },
    { value: 'fake_products', label: 'Размещение фейковых товаров' },
    { value: 'violation', label: 'Нарушение правил платформы' },
    { value: 'custom', label: 'Свое сообщение' },
  ];

  const templateMessages: { [key: string]: string } = {
    spam: 'Уважаемый пользователь, вы получили предупреждение за рассылку спама. При повторном нарушении ваш аккаунт будет заблокирован.',
    inappropriate: 'Ваше поведение на платформе было признано неподобающим. Пожалуйста, соблюдайте правила общения.',
    fake_products: 'Обнаружено размещение товаров с недостоверной информацией. Убедитесь, что все ваши объявления соответствуют действительности.',
    violation: 'Вы нарушили правила использования платформы. Ознакомьтесь с пользовательским соглашением.',
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [statusFilter, roleFilter, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (search) params.search = search;
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') params.is_active = true;
        if (statusFilter === 'banned') params.is_banned = true;
      }
      if (roleFilter !== 'all') params.role = roleFilter;

      const response = await api.get('/users/admin/all', { params });
      setUsers(response.data || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/users/admin/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/users/admin/${userId}/details`);
      setUserDetails(response.data);
    } catch (err: any) {
      console.error('Error loading user details:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить детали пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      tariff: user.tariff || 'free',
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleOpenWarning = (user: User) => {
    setSelectedUser(user);
    setWarningMessage('');
    setWarningTemplate('');
    setWarningDialogOpen(true);
  };

  const handleOpenDetails = async (user: User) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
    await loadUserDetails(user.id);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await api.put(`/users/admin/${selectedUser.id}`, editForm);
      setSuccess('Пользователь успешно обновлен');
      setEditDialogOpen(false);
      loadUsers();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось обновить пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await api.delete(`/users/admin/${selectedUser.id}`);
      setSuccess('Пользователь успешно удален');
      setDeleteDialogOpen(false);
      loadUsers();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось удалить пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (user: User) => {
    try {
      setLoading(true);
      await api.put(`/users/admin/${user.id}/ban`, { is_banned: !user.is_banned });
      setSuccess(user.is_banned ? 'Пользователь разблокирован' : 'Пользователь заблокирован');
      loadUsers();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось изменить статус');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWarning = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await api.post(`/users/admin/${selectedUser.id}/warning`, {
        message: warningMessage,
      });
      setSuccess('Предупреждение отправлено');
      setWarningDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось отправить предупреждение');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (template: string) => {
    setWarningTemplate(template);
    if (template && template !== 'custom') {
      setWarningMessage(templateMessages[template] || '');
    } else {
      setWarningMessage('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusChip = (user: User) => {
    if (user.is_banned) {
      return <Chip label="Заблокирован" color="error" size="small" />;
    }
    if (user.is_active) {
      return <Chip label="Активен" color="success" size="small" />;
    }
    return <Chip label="Неактивен" color="default" size="small" />;
  };

  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      user: 'Пользователь',
      seller: 'Продавец',
      admin: 'Администратор',
    };
    return roles[role] || role;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Управление пользователями
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Всего пользователей
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
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
                    Активных
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {stats.active}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
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
                    Заблокировано
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {stats.banned}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <PersonOff />
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
                    Новых за месяц
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="info.main">
                    {stats.newThisMonth}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PersonAdd />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Поиск по имени или email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Статус"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="banned">Заблокированные</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Роль"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="seller">Продавец</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Тариф</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">Пользователи не найдены</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={user.avatar} alt={user.full_name}>
                        {user.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography>{user.full_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>{getStatusChip(user)}</TableCell>
                  <TableCell>{getRoleLabel(user.role)}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.tariff?.toUpperCase() || 'FREE'}
                      size="small"
                      color={user.tariff === 'business' ? 'warning' : user.tariff === 'pro' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDetails(user)}
                        title="Просмотр"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleOpenEdit(user)}
                        title="Редактировать"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={user.is_banned ? 'success' : 'error'}
                        onClick={() => handleToggleBan(user)}
                        title={user.is_banned ? 'Разблокировать' : 'Заблокировать'}
                      >
                        <Block />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleOpenWarning(user)}
                        title="Предупреждение"
                      >
                        <Warning />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(user)}
                        title="Удалить"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Полное имя"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Телефон"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Роль"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="seller">Продавец</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </TextField>
            <TextField
              select
              label="Тариф"
              value={editForm.tariff}
              onChange={(e) => setEditForm({ ...editForm, tariff: e.target.value })}
              fullWidth
            >
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="pro">Pro</MenuItem>
              <MenuItem value="business">Business</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained" disabled={loading}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя {selectedUser?.full_name}?
            Это действие необратимо.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={warningDialogOpen} onClose={() => setWarningDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отправить предупреждение</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Шаблон сообщения"
              value={warningTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              fullWidth
            >
              {warningTemplates.map((template) => (
                <MenuItem key={template.value} value={template.value}>
                  {template.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Сообщение"
              multiline
              rows={4}
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              fullWidth
              placeholder="Введите текст предупреждения"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSendWarning}
            variant="contained"
            color="warning"
            disabled={loading || !warningMessage}
          >
            Отправить
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Детали пользователя: {selectedUser?.full_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={detailsTab} onChange={(_, newValue) => setDetailsTab(newValue)}>
              <Tab label="Заказы" />
              <Tab label="Товары" />
              <Tab label="Кошелек" />
              <Tab label="Транзакции" />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Orders Tab */}
              {detailsTab === 0 && (
                <Box>
                  {userDetails?.orders && userDetails.orders.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Товар</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Дата</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userDetails.orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.product_title}</TableCell>
                              <TableCell>{order.total_amount} сом</TableCell>
                              <TableCell>
                                <Chip label={order.status} size="small" />
                              </TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      Нет заказов
                    </Typography>
                  )}
                </Box>
              )}

              {/* Products Tab */}
              {detailsTab === 1 && (
                <Box>
                  {userDetails?.products && userDetails.products.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Цена</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Дата</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userDetails.products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.title}</TableCell>
                              <TableCell>{product.price} сом</TableCell>
                              <TableCell>
                                <Chip label={product.status} size="small" />
                              </TableCell>
                              <TableCell>{formatDate(product.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      Нет товаров
                    </Typography>
                  )}
                </Box>
              )}

              {/* Wallet Tab */}
              {detailsTab === 2 && (
                <Box>
                  {userDetails?.wallet ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              Основной баланс
                            </Typography>
                            <Typography variant="h4" fontWeight={600}>
                              {userDetails.wallet.main_balance} сом
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              Реферальный баланс
                            </Typography>
                            <Typography variant="h4" fontWeight={600}>
                              {userDetails.wallet.referral_balance} сом
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      Нет данных о кошельке
                    </Typography>
                  )}
                </Box>
              )}

              {/* Transactions Tab */}
              {detailsTab === 3 && (
                <Box>
                  {userDetails?.transactions && userDetails.transactions.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Тип</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Дата</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userDetails.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <Chip label={transaction.type} size="small" />
                              </TableCell>
                              <TableCell>{transaction.amount} сом</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>{formatDate(transaction.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      Нет транзакций
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Закрыть</Button>
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

export default AdminUsersPage;
