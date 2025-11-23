import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  NavigateNext,
  Handshake,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../../services/api';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images: string[];
  status: string;
  referral_commission_amount?: number;
  referral_commission_percent?: number;
}

const PartnerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartnerProducts();
  }, []);

  const loadPartnerProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({
        has_referral: true,
        limit: 100,
        offset: 0,
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setPartnerProducts(productsData);
    } catch (err: any) {
      console.error('Error loading partner products:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить партнерские товары');
    } finally {
      setLoading(false);
    }
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
        <Typography color="text.primary">Партнерские товары</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Партнерские товары и услуги
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Товары с партнерской программой - зарабатывайте, делясь ссылками
        </Typography>
      </Box>

      {/* Info Box */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.50' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          💰 Как зарабатывать?
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          1. Выберите товар с партнерской программой из списка ниже
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          2. Скопируйте партнерскую ссылку на странице товара
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          3. Поделитесь ссылкой с друзьями или на своих платформах
        </Typography>
        <Typography variant="body2" color="text.secondary">
          4. Получайте комиссию за каждую покупку по вашей ссылке на реферальный баланс
        </Typography>
      </Paper>

      {/* Content */}
      {partnerProducts.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Handshake sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Нет товаров с партнерской программой
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Товары с партнерской программой позволяют вам зарабатывать, делясь ссылками на них
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Смотреть все товары
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {partnerProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                  position: 'relative',
                }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {product.discount_price && (
                  <Chip
                    label="Скидка"
                    color="secondary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  />
                )}
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : 'https://via.placeholder.com/200'
                  }
                  alt={product.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 1,
                    }}
                  >
                    {product.title}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                    {product.discount_price || product.price} сом
                  </Typography>

                  {/* Referral Commission Info */}
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Ваша комиссия:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600} color="success.main">
                      {product.referral_commission_amount || 0} сом ({product.referral_commission_percent || 0}%)
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`);
                    }}
                  >
                    Получить ссылку
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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

export default PartnerProductsPage;
