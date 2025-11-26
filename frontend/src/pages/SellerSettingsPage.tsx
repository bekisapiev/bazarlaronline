import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Store as StoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationOnIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI, sellerProfileAPI, uploadAPI, locationsAPI, categoriesAPI } from '../services/api';

interface SellerProfile {
  id?: string;
  shop_name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  category_id?: number;
  city_id?: number;
  seller_type?: string;
  market_id?: number;
  address?: string;
  map_url?: string;
  rating?: number;
  reviews_count?: number;
  is_verified?: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  seller_profile?: SellerProfile;
}

const SellerSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<SellerProfile>>({});

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reference data
  const [cities, setCities] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadReferenceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getCurrentUser();
      setProfile(response.data);

      if (response.data.seller_profile) {
        setSellerProfile(response.data.seller_profile);
        setEditedProfile(response.data.seller_profile);

        // Load markets if city is selected
        if (response.data.seller_profile.city_id) {
          loadMarkets(response.data.seller_profile.city_id);
        }
      } else {
        // No seller profile yet, enter edit mode
        setIsEditing(true);
        setEditedProfile({ shop_name: '' });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [citiesRes, categoriesRes] = await Promise.all([
        locationsAPI.getCities(),
        categoriesAPI.getCategoryTree(),
      ]);

      const citiesData = Array.isArray(citiesRes.data)
        ? citiesRes.data
        : citiesRes.data.items || citiesRes.data.cities || [];
      setCities(citiesData);

      const categoriesData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.tree || categoriesRes.data.items || categoriesRes.data.categories || [];
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error loading reference data:', err);
    }
  };

  const loadMarkets = async (cityId: number) => {
    try {
      const response = await locationsAPI.getMarkets({ city_id: cityId });
      const marketsData = Array.isArray(response.data)
        ? response.data
        : response.data.items || response.data.markets || [];
      setMarkets(marketsData);
    } catch (err: any) {
      console.error('Error loading markets:', err);
      setMarkets([]);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const response = await uploadAPI.uploadImage(file);
      const logoUrl = response.data.url;
      setEditedProfile({ ...editedProfile, logo_url: logoUrl });
      setSuccess('Логотип загружен');
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить логотип');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const response = await uploadAPI.uploadImage(file);
      const bannerUrl = response.data.url;
      setEditedProfile({ ...editedProfile, banner_url: bannerUrl });
      setSuccess('Баннер загружен');
    } catch (err: any) {
      console.error('Error uploading banner:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить баннер');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!editedProfile.shop_name?.trim()) {
        setError('Название магазина обязательно для заполнения');
        return;
      }

      if (sellerProfile?.id) {
        await sellerProfileAPI.updateProfile(editedProfile);
      } else {
        await sellerProfileAPI.createProfile(editedProfile);
      }

      await loadProfile();
      setIsEditing(false);
      setSuccess('Настройки продавца успешно сохранены');
    } catch (err: any) {
      console.error('Error saving seller profile:', err);
      setError(err.response?.data?.detail || 'Не удалось сохранить настройки продавца');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!sellerProfile) {
      // If no profile exists, go back to profile page
      navigate('/profile');
      return;
    }
    setIsEditing(false);
    setEditedProfile(sellerProfile);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const displayProfile = isEditing ? editedProfile : sellerProfile || {};

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <MuiLink component={Link} to="/profile" underline="hover" color="inherit">
          Профиль
        </MuiLink>
        <Typography color="text.primary">Настройки продавца</Typography>
      </Breadcrumbs>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Отмена
            </Button>
          </Box>
        )}
      </Box>

      {/* Seller Header */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        {/* Banner */}
        <Box sx={{ position: 'relative' }}>
          {displayProfile.banner_url ? (
            <Box
              sx={{
                height: 300,
                backgroundImage: `url(${displayProfile.banner_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <Box
              sx={{
                height: 300,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StoreIcon sx={{ fontSize: 100, color: 'primary.main' }} />
            </Box>
          )}

          {/* Banner Upload Button */}
          {isEditing && (
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.paper' },
              }}
              disabled={uploadingBanner}
            >
              {uploadingBanner ? <CircularProgress size={24} /> : <CloudUploadIcon />}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleBannerUpload}
              />
            </IconButton>
          )}
        </Box>

        {/* Seller Info */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            {/* Logo */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={displayProfile.logo_url || undefined}
                alt={displayProfile.shop_name}
                sx={{
                  width: 120,
                  height: 120,
                  mt: -8,
                  border: '4px solid white',
                  boxShadow: 3,
                }}
              >
                <StoreIcon sx={{ fontSize: 60 }} />
              </Avatar>

              {/* Logo Upload Button */}
              {isEditing && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                    border: '2px solid white',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                  size="small"
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? <CircularProgress size={16} /> : <CloudUploadIcon fontSize="small" />}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </IconButton>
              )}
            </Box>

            {/* Details */}
            <Box sx={{ flexGrow: 1 }}>
              {!isEditing ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h4" fontWeight={600}>
                      {displayProfile.shop_name || 'Название магазина'}
                    </Typography>
                    {sellerProfile?.is_verified && (
                      <VerifiedIcon color="primary" sx={{ fontSize: 30 }} />
                    )}
                  </Box>

                  {sellerProfile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        ⭐ {sellerProfile.rating?.toFixed(1) || 0} ({sellerProfile.reviews_count || 0} отзывов)
                      </Typography>
                    </Box>
                  )}

                  {displayProfile.city_id && cities.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body1" color="text.secondary">
                        {cities.find(c => c.id === displayProfile.city_id)?.name || ''}
                        {displayProfile.market_id && markets.length > 0 &&
                          `, ${markets.find(m => m.id === displayProfile.market_id)?.name || ''}`}
                      </Typography>
                    </Box>
                  )}

                  {displayProfile.seller_type && (
                    <Chip
                      label={getSellerTypeLabel(displayProfile.seller_type)}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </>
              ) : (
                <Grid container spacing={2} sx={{ mt: -6 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Название магазина *"
                      value={editedProfile.shop_name || ''}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, shop_name: e.target.value })
                      }
                      required
                      error={!editedProfile.shop_name}
                      helperText={!editedProfile.shop_name ? 'Обязательное поле' : ''}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>

          {/* Description */}
          <Divider sx={{ my: 3 }} />

          {!isEditing ? (
            <Typography variant="body1" paragraph>
              {displayProfile.description || 'Нет описания'}
            </Typography>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Описание"
              value={editedProfile.description || ''}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, description: e.target.value })
              }
              placeholder="Расскажите о вашем магазине..."
            />
          )}

          {/* Additional Fields in Edit Mode */}
          {isEditing && (
            <>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Тип продавца"
                    value={editedProfile.seller_type || ''}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, seller_type: e.target.value })
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">Не выбрано</option>
                    <option value="market">Рынок</option>
                    <option value="boutique">Бутик</option>
                    <option value="shop">Магазин</option>
                    <option value="office">Офис</option>
                    <option value="home">Дом</option>
                    <option value="mobile">Мобильный</option>
                    <option value="warehouse">Склад</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Категория"
                    value={editedProfile.category_id || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        category_id: parseInt(e.target.value) || undefined,
                      })
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="">Не выбрано</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Город"
                    value={editedProfile.city_id || ''}
                    onChange={(e) => {
                      const cityId = parseInt(e.target.value);
                      setEditedProfile({
                        ...editedProfile,
                        city_id: cityId || undefined,
                        market_id: undefined,
                      });
                      if (cityId) {
                        loadMarkets(cityId);
                      } else {
                        setMarkets([]);
                      }
                    }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Не выбрано</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Рынок"
                    value={editedProfile.market_id || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        market_id: parseInt(e.target.value) || undefined,
                      })
                    }
                    disabled={!editedProfile.city_id}
                    SelectProps={{ native: true }}
                    helperText={!editedProfile.city_id ? 'Сначала выберите город' : ''}
                  >
                    <option value="">Не выбрано</option>
                    {markets.map((market) => (
                      <option key={market.id} value={market.id}>
                        {market.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Адрес"
                    value={editedProfile.address || ''}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, address: e.target.value })
                    }
                    placeholder="Введите адрес вашего магазина"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ссылка на карту"
                    value={editedProfile.map_url || ''}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, map_url: e.target.value })
                    }
                    placeholder="https://maps.google.com/..."
                    InputProps={{
                      startAdornment: <MapIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    helperText="Ссылка на Google Maps, 2GIS или другой сервис карт"
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Address in View Mode */}
          {!isEditing && displayProfile.address && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Адрес
                </Typography>
                <Typography variant="body1">{displayProfile.address}</Typography>
                {displayProfile.map_url && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MapIcon />}
                    href={displayProfile.map_url}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    Открыть на карте
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Snackbar for success/error messages */}
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
    </Container>
  );
};

// Helper function to get seller type label in Russian
function getSellerTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    market: 'Рынок',
    boutique: 'Бутик',
    shop: 'Магазин',
    office: 'Офис',
    home: 'Дом',
    mobile: 'Мобильный',
    warehouse: 'Склад',
  };
  return labels[type] || type;
}

export default SellerSettingsPage;
