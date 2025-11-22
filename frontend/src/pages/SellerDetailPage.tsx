import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  Rating,
  Chip,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images: string[];
  is_promoted: boolean;
  views_count: number;
}

interface SellerDetail {
  id: string;
  user_id: string;
  shop_name: string;
  description?: string;
  banner_url?: string;
  logo_url?: string;
  city_id?: number;
  city_name?: string;
  seller_type?: string;
  market_id?: number;
  market_name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  products_count: number;
  created_at: string;
  user_tariff?: string;
  products?: Product[];
}

const SellerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadSellerDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadSellerDetails = async () => {
    if (!id) return;

    setLoading(true);
    setError('');
    try {
      const response = await productsAPI.getSellerById(id, true);
      setSeller(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки данных продавца');
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

  if (error || !seller) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Продавец не найден'}</Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/sellers')}
            sx={{ mt: 2 }}
          >
            Вернуться к каталогу продавцов
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <MuiLink component={Link} to="/sellers" underline="hover" color="inherit">
          Продавцы
        </MuiLink>
        <Typography color="text.primary">{seller.shop_name}</Typography>
      </Breadcrumbs>

      {/* Seller Header */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        {/* Banner */}
        {seller.banner_url ? (
          <Box
            sx={{
              height: 300,
              backgroundImage: `url(${seller.banner_url})`,
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

        {/* Seller Info */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            {/* Logo */}
            <Avatar
              src={seller.logo_url || undefined}
              alt={seller.shop_name}
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

            {/* Details */}
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h4" fontWeight={600}>
                  {seller.shop_name}
                </Typography>
                {seller.is_verified && (
                  <VerifiedIcon color="primary" sx={{ fontSize: 30 }} />
                )}
              </Box>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating value={seller.rating} precision={0.1} readOnly />
                <Typography variant="body1" color="text.secondary">
                  {seller.rating.toFixed(1)} ({seller.reviews_count} отзывов)
                </Typography>
              </Box>

              {/* Location */}
              {seller.city_name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body1" color="text.secondary">
                    {seller.city_name}
                    {seller.market_name && `, ${seller.market_name}`}
                  </Typography>
                </Box>
              )}

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Chip
                  icon={<StoreIcon />}
                  label={`${seller.products_count} товаров`}
                  variant="outlined"
                />
                {seller.user_tariff && (
                  <Chip
                    label={seller.user_tariff.toUpperCase()}
                    color="primary"
                    variant="filled"
                  />
                )}
              </Box>
            </Box>

            {/* Contact Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<PhoneIcon />}
              onClick={() => navigate(`/chat?seller=${seller.user_id}`)}
            >
              Связаться
            </Button>
          </Box>

          {/* Description */}
          {seller.description && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body1" paragraph>
                {seller.description}
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* Products Section */}
      {seller.products && seller.products.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Товары продавца
          </Typography>
          <Grid container spacing={3}>
            {seller.products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s',
                    },
                  }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : '/placeholder.png'
                    }
                    alt={product.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" noWrap gutterBottom>
                      {product.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        {product.discount_price || product.price} сом
                      </Typography>
                      {product.discount_price && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          {product.price} сом
                        </Typography>
                      )}
                    </Box>
                    {product.is_promoted && (
                      <Chip
                        label="Продвигается"
                        color="secondary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(`/products?seller=${seller.user_id}`)}
            >
              Показать все товары
            </Button>
          </Box>
        </Box>
      )}

      {/* No products message */}
      {seller.products && seller.products.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            У этого продавца пока нет товаров
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SellerDetailPage;
