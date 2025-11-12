import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { productsAPI, recommendationsAPI } from '../services/api';
import { setProducts, setLoading } from '../store/slices/productsSlice';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  images: string[];
  is_promoted: boolean;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state: RootState) => state.products);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [hotDeals, setHotDeals] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingNew, setLoadingNew] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    if (isAuthenticated) {
      loadRecommendedProducts();
    }
    loadTrendingProducts();
    loadNewArrivals();
    loadHotDeals();
  }, [isAuthenticated]);

  const loadProducts = async () => {
    try {
      dispatch(setLoading(true));
      const response = await productsAPI.getProducts({ limit: 12 });
      dispatch(setProducts(response.data));
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Ошибка загрузки товаров');
    }
  };

  const loadRecommendedProducts = async () => {
    try {
      setLoadingRecommended(true);
      const response = await recommendationsAPI.getPersonalized(8);
      setRecommendedProducts(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading recommended products:', error);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const loadTrendingProducts = async () => {
    try {
      setLoadingTrending(true);
      const response = await recommendationsAPI.getTrending({ limit: 8 });
      setTrendingProducts(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading trending products:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  const loadNewArrivals = async () => {
    try {
      setLoadingNew(true);
      const response = await recommendationsAPI.getNewArrivals({ limit: 8 });
      setNewArrivals(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading new arrivals:', error);
    } finally {
      setLoadingNew(false);
    }
  };

  const loadHotDeals = async () => {
    try {
      setLoadingDeals(true);
      const response = await recommendationsAPI.getDeals({ limit: 8 });
      setHotDeals(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading hot deals:', error);
    } finally {
      setLoadingDeals(false);
    }
  };

  const renderProductCard = (product: Product) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': { boxShadow: 4 },
        minWidth: 250,
      }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <CardMedia
        component="img"
        height="250"
        image={product.images[0] || 'https://via.placeholder.com/350'}
        alt={product.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {product.is_promoted && (
          <Chip
            label="Поднято"
            color="primary"
            size="small"
            sx={{ mb: 1 }}
          />
        )}
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {product.discount_price ? (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {product.price} сом
              </Typography>
              <Typography variant="h6" color="secondary.main" fontWeight={600}>
                {product.discount_price} сом
              </Typography>
              <Chip
                label={`-${product.discount_percent}%`}
                color="secondary"
                size="small"
              />
            </>
          ) : (
            <Typography variant="h6" fontWeight={600}>
              {product.price} сом
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" fullWidth>
          Заказать
        </Button>
      </CardActions>
    </Card>
  );

  const renderProductSection = (
    title: string,
    products: Product[],
    loading: boolean,
    emptyMessage: string
  ) => (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
        {title}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : products.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: 10,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: 10,
              '&:hover': {
                backgroundColor: '#555',
              },
            },
          }}
        >
          {products.map((product) => (
            <Box key={product.id} sx={{ flexShrink: 0, width: 250 }}>
              {renderProductCard(product)}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
          {emptyMessage}
        </Typography>
      )}
    </Box>
  );

  return (
    <Container maxWidth="xl">
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          borderRadius: 2,
          color: 'white',
          mb: 6,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
          Bazarlar Online
        </Typography>
        <Typography variant="h5" gutterBottom>
          Торговая площадка Кыргызстана
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Покупайте и продавайте товары и услуги. Зарабатывайте с партнерской программой.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            sx={{ bgcolor: 'white', color: 'primary.main' }}
            onClick={() => navigate('/products')}
          >
            Смотреть товары
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ borderColor: 'white', color: 'white' }}
            onClick={() => navigate('/add')}
          >
            Добавить объявление
          </Button>
        </Box>
      </Box>

      {/* Latest Products */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          Последние объявления
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                {renderProductCard(product)}
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && products.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 8 }}>
            Нет доступных товаров
          </Typography>
        )}
      </Box>

      {/* Recommended for You (Authenticated Users Only) */}
      {isAuthenticated && renderProductSection(
        '🎯 Рекомендуем для вас',
        recommendedProducts,
        loadingRecommended,
        'Нет рекомендованных товаров'
      )}

      {/* Trending Now */}
      {renderProductSection(
        '🔥 Сейчас в тренде',
        trendingProducts,
        loadingTrending,
        'Нет трендовых товаров'
      )}

      {/* New Arrivals */}
      {renderProductSection(
        '✨ Новинки',
        newArrivals,
        loadingNew,
        'Нет новых товаров'
      )}

      {/* Hot Deals */}
      {renderProductSection(
        '💥 Горячие предложения',
        hotDeals,
        loadingDeals,
        'Нет товаров со скидками'
      )}

      {/* Call to Action */}
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          backgroundColor: '#F5F5F5',
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Начните продавать сегодня
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Создайте свой магазин и начните зарабатывать
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => navigate('/add')}
        >
          Добавить объявление
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
