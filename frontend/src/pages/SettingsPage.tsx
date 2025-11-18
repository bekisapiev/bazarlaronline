import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Save,
  Language,
  Notifications,
  Security,
  CloudDownload,
  DeleteForever,
  NavigateNext,
  Warning,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { settingsAPI } from '../services/api';
import {
  setSettings,
  updateSettings as updateSettingsAction,
  setLoading,
  setError as setErrorAction,
} from '../store/slices/settingsSlice';
import type { UserSettings } from '../store/slices/settingsSlice';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { settings, loading, error: storeError } = useSelector(
    (state: RootState) => state.settings
  );

  const [localSettings, setLocalSettings] = useState<UserSettings>({
    language: 'ru',
    notifications: {
      order_updates: true,
      new_reviews: true,
      new_messages: true,
      promotions: false,
      email_notifications: true,
    },
    privacy: {
      show_phone: false,
      show_email: false,
      show_last_seen: true,
      allow_messages: true,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await settingsAPI.getSettings();
      dispatch(setSettings(response.data));
    } catch (err: any) {
      console.error('Error loading settings:', err);
      const errorMessage = err.response?.data?.detail || 'Не удалось загрузить настройки';
      dispatch(setErrorAction(errorMessage));
      setError(errorMessage);
    }
  }, [dispatch]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);

  const handleLanguageChange = (value: string) => {
    setLocalSettings({ ...localSettings, language: value });
    setHasChanges(true);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [key]: value,
      },
    });
    setHasChanges(true);
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setLocalSettings({
      ...localSettings,
      privacy: {
        ...localSettings.privacy,
        [key]: value,
      },
    });
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      dispatch(setLoading(true));
      await settingsAPI.updateSettings(localSettings);
      dispatch(updateSettingsAction(localSettings));
      setHasChanges(false);
      setSuccess('Настройки успешно сохранены');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.detail || 'Не удалось сохранить настройки');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const response = await settingsAPI.exportData();

      // Create a blob from the response and download it
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bazarlar-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Данные успешно экспортированы');
    } catch (err: any) {
      console.error('Error exporting data:', err);
      setError(err.response?.data?.detail || 'Не удалось экспортировать данные');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'удалить') {
      setError('Введите "удалить" для подтверждения');
      return;
    }

    try {
      dispatch(setLoading(true));
      await settingsAPI.requestDataDeletion();
      setDeleteDialogOpen(false);
      setSuccess(
        'Запрос на удаление аккаунта отправлен. Вы получите подтверждение на email.'
      );
      // Optionally redirect to home page after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Error requesting account deletion:', err);
      setError(err.response?.data?.detail || 'Не удалось отправить запрос на удаление');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const languageOptions = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
    { value: 'ky', label: 'Кыргызча' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
        <Typography color="text.primary">Настройки</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Настройки
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление языком, уведомлениями и настройками приватности
        </Typography>
      </Box>

      {loading && !settings ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Language Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Language sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Язык интерфейса
              </Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Выберите язык</InputLabel>
              <Select
                value={localSettings.language}
                label="Выберите язык"
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Notification Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Notifications sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Уведомления
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.notifications.order_updates}
                      onChange={(e) =>
                        handleNotificationChange('order_updates', e.target.checked)
                      }
                    />
                  }
                  label="Обновления о заказах"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Получать уведомления о статусе ваших заказов
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.notifications.new_reviews}
                      onChange={(e) =>
                        handleNotificationChange('new_reviews', e.target.checked)
                      }
                    />
                  }
                  label="Новые отзывы"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Уведомления о новых отзывах на ваши товары
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.notifications.new_messages}
                      onChange={(e) =>
                        handleNotificationChange('new_messages', e.target.checked)
                      }
                    />
                  }
                  label="Новые сообщения"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Уведомления о новых сообщениях в чате
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.notifications.promotions}
                      onChange={(e) =>
                        handleNotificationChange('promotions', e.target.checked)
                      }
                    />
                  }
                  label="Акции и специальные предложения"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Получать информацию о скидках и акциях
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.notifications.email_notifications}
                      onChange={(e) =>
                        handleNotificationChange('email_notifications', e.target.checked)
                      }
                    />
                  }
                  label="Email уведомления"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Дублировать уведомления на электронную почту
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Privacy Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Приватность
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.privacy.show_phone}
                      onChange={(e) => handlePrivacyChange('show_phone', e.target.checked)}
                    />
                  }
                  label="Показывать телефон"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Другие пользователи смогут видеть ваш номер телефона
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.privacy.show_email}
                      onChange={(e) => handlePrivacyChange('show_email', e.target.checked)}
                    />
                  }
                  label="Показывать email"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Другие пользователи смогут видеть ваш email
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.privacy.show_last_seen}
                      onChange={(e) =>
                        handlePrivacyChange('show_last_seen', e.target.checked)
                      }
                    />
                  }
                  label="Показывать последнюю активность"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Другие пользователи смогут видеть, когда вы были онлайн
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.privacy.allow_messages}
                      onChange={(e) =>
                        handlePrivacyChange('allow_messages', e.target.checked)
                      }
                    />
                  }
                  label="Разрешить сообщения"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Другие пользователи могут отправлять вам сообщения
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              disabled={!hasChanges || loading}
            >
              Сохранить настройки
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Data Management */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Управление данными
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              В соответствии с GDPR вы можете экспортировать или удалить ваши данные
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Export Data Card */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CloudDownload sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Экспорт данных
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Скачать все ваши данные в формате JSON. Включает профиль, заказы,
                    избранное и историю просмотров.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={handleExportData}
                    disabled={exportLoading}
                  >
                    {exportLoading ? 'Экспорт...' : 'Экспортировать данные'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Delete Account Card */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DeleteForever sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="h6" fontWeight={600} color="error">
                      Удалить аккаунт
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Безвозвратное удаление вашего аккаунта и всех связанных данных.
                    Это действие нельзя отменить.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Warning />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Запросить удаление
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1 }} />
            Удалить аккаунт?
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Это действие безвозвратно удалит ваш аккаунт и все связанные данные,
            включая:
          </DialogContentText>
          <Box component="ul" sx={{ pl: 2, my: 2 }}>
            <li>Профиль пользователя</li>
            <li>Историю заказов</li>
            <li>Избранные товары</li>
            <li>Историю просмотров</li>
            <li>Сообщения в чате</li>
            <li>Все настройки</li>
          </Box>
          <DialogContentText sx={{ mb: 2 }}>
            Введите <strong>"удалить"</strong> для подтверждения:
          </DialogContentText>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="удалить"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading || deleteConfirmText.toLowerCase() !== 'удалить'}
          >
            Удалить аккаунт
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
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

      {/* Error Snackbar */}
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

export default SettingsPage;
