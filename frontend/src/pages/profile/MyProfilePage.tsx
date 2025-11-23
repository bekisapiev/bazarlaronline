import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  NavigateNext,
  Edit,
  Save,
  Cancel,
  CloudUpload,
  ContentCopy,
  Upgrade,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usersAPI, uploadAPI } from '../../services/api';

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

const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [referralLink, setReferralLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<any>(null);

  useEffect(() => {
    loadProfile();
    loadReferralData();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
        <Typography color="text.primary">Мой профиль</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Мой профиль
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление личной информацией и настройками
        </Typography>
      </Box>

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
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyProfilePage;
