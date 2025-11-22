import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  Search,
  FilterList,
  ContentCopy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { productsAPI, usersAPI } from '../services/api';

interface ReferralProduct {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  images: string[];
  is_promoted: boolean;
  is_referral_enabled: boolean;
  referral_commission_percent: number;
  referral_commission_amount: number;
}

const ReferralProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [products, setProducts] = useState<ReferralProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('commission');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userReferralId, setUserReferralId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getReferralProducts({
        search: searchQuery || undefined,
        sort_by: sortBy,
        limit: 50,
      });
      setProducts(response.data.items || []);
    } catch (err: any) {
      console.error('Error loading referral products:', err);
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy]);

  const loadUserReferralId = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await usersAPI.getReferralLink();
      setUserReferralId(response.data.referral_code);
    } catch (err) {
      console.error('Error loading user referral ID:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserReferralId();
    }
  }, [isAuthenticated, loadUserReferralId]);

  const handleCopyReferralLink = (productId: string) => {
    if (!isAuthenticated) {
      setError('Войдите в систему, чтобы делиться реферальными ссылками');
      return;
    }

    if (!userReferralId) {
      setError('Не удалось получить ваш реферальный код');
      return;
    }

    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/products/${productId}?ref=${userReferralId}`;

    navigator.clipboard.writeText(referralLink).then(() => {
      setCopiedId(productId);
      setSuccessMessage('Реферальная ссылка скопирована в буфер обмена!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSearch = () => {
    loadProducts();
  };

  if (loading && products.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Товары с реферальной программой
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Делитесь ссылками на эти товары и получайте комиссию с каждой покупки
          </Typography>
        </Box>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <Button onClick={handleSearch}>Найти</Button>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Сортировка"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="commission">По комиссии (выше)</MenuItem>
                <MenuItem value="price">По цене</MenuItem>
                <MenuItem value="created">По дате добавления</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <Alert severity="info">
            Пока нет товаров с реферальной программой
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': { boxShadow: 6 },
                  }}
                >
                  {/* Promoted Badge */}
                  {product.is_promoted && (
                    <Chip
                      label="Поднято"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                    />
                  )}

                  {/* Commission Badge */}
                  <Chip
                    label={`${product.referral_commission_percent}% комиссия`}
                    color="secondary"
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                  />

                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0] || 'https://via.placeholder.com/350'}
                    alt={product.title}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  />

                  {/* Product Info */}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      noWrap
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.title}
                    </Typography>

                    {/* Price */}
                    <Box sx={{ mb: 1 }}>
                      {product.discount_price ? (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {product.price} сом
                          </Typography>
                          <Typography variant="h6" fontWeight={600} color="secondary.main">
                            {product.discount_price} сом
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6" fontWeight={600}>
                          {product.price} сом
                        </Typography>
                      )}
                    </Box>

                    {/* Commission Amount */}
                    <Paper sx={{ p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Ваша комиссия:
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">
                        {product.referral_commission_amount} сом
                      </Typography>
                    </Paper>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      fullWidth
                      variant="outlined"
                      startIcon={copiedId === product.id ? null : <ContentCopy />}
                      onClick={() => handleCopyReferralLink(product.id)}
                      color={copiedId === product.id ? 'success' : 'primary'}
                    >
                      {copiedId === product.id ? 'Скопировано!' : 'Копировать ссылку'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Info Box */}
        {isAuthenticated && (
          <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.50' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Как работает реферальная программа?
            </Typography>
            <Typography variant="body2" paragraph>
              1. Скопируйте реферальную ссылку на любой товар выше
            </Typography>
            <Typography variant="body2" paragraph>
              2. Поделитесь ей с друзьями или в социальных сетях
            </Typography>
            <Typography variant="body2" paragraph>
              3. Когда кто-то купит товар по вашей ссылке, вы получите комиссию
            </Typography>
            <Typography variant="body2">
              4. Комиссия зачисляется на ваш реферальный счет в течение 10 дней после покупки
            </Typography>
          </Paper>
        )}

        {!isAuthenticated && (
          <Paper sx={{ p: 3, mt: 4, bgcolor: 'warning.50' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Войдите, чтобы получать комиссию
            </Typography>
            <Typography variant="body2" paragraph>
              Зарегистрируйтесь или войдите в систему, чтобы делиться реферальными ссылками и зарабатывать на каждой покупке.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Войти
            </Button>
          </Paper>
        )}
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Container>
  );
};

export default ReferralProductsPage;
