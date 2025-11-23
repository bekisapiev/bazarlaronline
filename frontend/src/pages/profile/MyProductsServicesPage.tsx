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
  Storefront,
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
  created_at: string;
  views?: number;
  referral_commission_amount?: number;
  referral_commission_percent?: number;
}

const MyProductsServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getMyProducts({
        limit: 50,
        offset: 0,
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setMyProducts(productsData);
    } catch (err: any) {
      console.error('Error loading my products:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить товары');
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
        <Typography color="text.primary">Мои товары и услуги</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Мои товары и услуги
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {myProducts.length > 0
              ? `Всего товаров: ${myProducts.length}`
              : 'У вас пока нет товаров'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/add')}
        >
          Добавить товар
        </Button>
      </Box>

      {/* Content */}
      {myProducts.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Storefront sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет товаров и услуг
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/add')}
          >
            Добавить товар или услугу
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {myProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
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
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {product.discount_price || product.price} сом
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip
                      label={product.status === 'active' ? 'Активен' : product.status === 'moderation' ? 'На модерации' : 'Неактивен'}
                      color={product.status === 'active' ? 'success' : product.status === 'moderation' ? 'warning' : 'default'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Просмотры: {product.views || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      Посмотреть
                    </Button>
                  </Box>
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

export default MyProductsServicesPage;
