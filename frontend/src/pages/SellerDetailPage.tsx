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
  Avatar,
  Rating,
  Chip,
  Divider,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sellerProfileAPI } from '../services/api';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images: string[];
  is_promoted: boolean;
  views_count: number;
}

interface Seller {
  id: string;
  user_id: string;
  shop_name: string;
  description?: string;
  banner_url?: string;
  logo_url?: string;
  city_id?: number;
  city_name?: string;
  seller_type: string;
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
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSellerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadSellerDetails = async () => {
    if (!id) return;

    setLoading(true);
    setError('');
    try {
      const response = await sellerProfileAPI.getSellerDetails(id, true);
      setSeller(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки информации о продавце');
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
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Продавец не найден'}
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/sellers')}>
          Вернуться к списку продавцов
        </Button>
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

      {/* Banner */}
      {seller.banner_url && (
        <Box
          sx={{
            width: '100%',
            height: 300,
            backgroundImage: `url(${seller.banner_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 2,
            mb: 3,
          }}
        />
      )}

      {/* Seller Info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {seller.logo_url && (
                <Avatar
                  src={seller.logo_url}
                  alt={seller.shop_name}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  <StoreIcon sx={{ fontSize: 40 }} />
                </Avatar>
              )}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" fontWeight={600}>
                    {seller.shop_name}
                  </Typography>
                  {seller.is_verified && (
                    <VerifiedIcon color="primary" sx={{ fontSize: 32 }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Rating value={seller.rating} precision={0.1} readOnly />
                  <Typography variant="body1" color="text.secondary">
                    {seller.rating.toFixed(1)} ({seller.reviews_count} отзывов)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {seller.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {seller.description}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              {seller.city_name && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="action" />
                    <Typography variant="body1">
                      {seller.city_name}
                      {seller.market_name && `, ${seller.market_name}`}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {seller.address && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {seller.address}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Статистика
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon color="action" />
                  <Typography variant="body1">
                    Товаров: <strong>{seller.products_count}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon color="action" />
                  <Typography variant="body1">
                    Рейтинг: <strong>{seller.rating.toFixed(1)}</strong>
                  </Typography>
                </Box>
                {seller.seller_type && (
                  <Box>
                    <Chip
                      label={seller.seller_type}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                )}
                {seller.user_tariff && (
                  <Box>
                    <Chip
                      label={`Тариф: ${seller.user_tariff}`}
                      size="small"
                      color="primary"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Section */}
      {seller.products && seller.products.length > 0 && (
        <>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
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
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s',
                    },
                  }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.is_promoted && (
                    <Chip
                      label="Продвигается"
                      color="primary"
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
                    image={product.images[0] || 'https://via.placeholder.com/400'}
                    alt={product.title}
                    sx={{ objectFit: 'cover' }}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      noWrap
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      {product.title}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      {product.discount_price ? (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {product.price} сом
                          </Typography>
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            {product.discount_price} сом
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          {product.price} сом
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Просмотров: {product.views_count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {seller.products_count > 12 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(`/products?seller_id=${seller.user_id}`)}
              >
                Показать все товары ({seller.products_count})
              </Button>
            </Box>
          )}
        </>
      )}

      {(!seller.products || seller.products.length === 0) && (
        <Alert severity="info" sx={{ mt: 4 }}>
          У этого продавца пока нет активных товаров
        </Alert>
      )}
    </Container>
  );
};

export default SellerDetailPage;
