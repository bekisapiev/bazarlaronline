import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ShoppingCart,
  Star,
  Gavel,
  Settings as SettingsIcon,
  AccountBalanceWallet,
  Delete,
  DoneAll,
  MarkEmailRead,
  MarkEmailUnread,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { notificationsAPI } from '../services/api';
import {
  setNotifications,
  addNotifications,
  markAsRead,
  markAllAsRead as markAllAsReadAction,
  deleteNotification as deleteNotificationAction,
  setLoading,
  setHasMore,
} from '../store/slices/notificationsSlice';

type NotificationType = 'all' | 'order' | 'review' | 'moderation' | 'system' | 'wallet';

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items: notifications, loading, hasMore } = useSelector(
    (state: RootState) => state.notifications
  );

  const [currentFilter, setCurrentFilter] = useState<NotificationType>('all');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadNotifications = useCallback(async (reset: boolean = false) => {
    try {
      setError(null);
      if (reset) {
        dispatch(setLoading(true));
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        limit: 20,
        offset: reset ? 0 : (page - 1) * 20,
      };

      if (currentFilter !== 'all') {
        params.type = currentFilter;
      }

      const response = await notificationsAPI.getNotifications(params);

      if (reset) {
        dispatch(setNotifications(response.data));
      } else {
        dispatch(addNotifications(response.data));
      }

      dispatch(setHasMore(response.data.length === 20));

      if (!reset) {
        setPage(page + 1);
      }
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить уведомления');
    } finally {
      dispatch(setLoading(false));
      setLoadingMore(false);
    }
  }, [currentFilter, page, dispatch]);

  useEffect(() => {
    loadNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter]);

  const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
    try {
      if (!isRead) {
        await notificationsAPI.markAsRead(notificationId);
        dispatch(markAsRead(notificationId));
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.response?.data?.detail || 'Не удалось обновить уведомление');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      dispatch(markAllAsReadAction());
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      setError(err.response?.data?.detail || 'Не удалось отметить все как прочитанные');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      dispatch(deleteNotificationAction(notificationId));
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err.response?.data?.detail || 'Не удалось удалить уведомление');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadNotifications(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart color="primary" />;
      case 'review':
        return <Star color="warning" />;
      case 'moderation':
        return <Gavel color="error" />;
      case 'system':
        return <SettingsIcon color="action" />;
      case 'wallet':
        return <AccountBalanceWallet color="success" />;
      default:
        return <NotificationsIcon color="info" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      return 'Только что';
    } else if (hours < 24) {
      return `${hours} ч. назад`;
    } else if (days < 7) {
      return `${days} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const filteredNotifications =
    currentFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === currentFilter);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Уведомления
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} непрочитанных`}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<DoneAll />}
            onClick={handleMarkAllAsRead}
            disabled={loading}
          >
            Отметить все как прочитанные
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentFilter}
          onChange={(_, value) => setCurrentFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Все" value="all" />
          <Tab label="Заказы" value="order" />
          <Tab label="Отзывы" value="review" />
          <Tab label="Модерация" value="moderation" />
          <Tab label="Система" value="system" />
          <Tab label="Кошелек" value="wallet" />
        </Tabs>
      </Paper>

      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Нет уведомлений
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentFilter === 'all'
              ? 'У вас пока нет уведомлений'
              : `Нет уведомлений типа "${currentFilter}"`}
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper>
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                      '&:hover': { backgroundColor: 'action.selected' },
                      cursor: 'pointer',
                      py: 2,
                    }}
                    onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                  >
                    <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={notification.is_read ? 400 : 600}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.is_read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {formatDate(notification.created_at)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id, notification.is_read);
                        }}
                        title={
                          notification.is_read
                            ? 'Отметить как непрочитанное'
                            : 'Отметить как прочитанное'
                        }
                        sx={{ mr: 1 }}
                      >
                        {notification.is_read ? <MarkEmailUnread /> : <MarkEmailRead />}
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        title="Удалить"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore}
                startIcon={loadingMore && <CircularProgress size={20} />}
              >
                {loadingMore ? 'Загрузка...' : 'Загрузить еще'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default NotificationsPage;
