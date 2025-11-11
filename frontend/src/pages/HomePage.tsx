import React, { useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { productsAPI } from '../services/api';
import { setProducts, setLoading } from '../store/slices/productsSlice';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      dispatch(setLoading(true));
      const response = await productsAPI.getProducts({ limit: 12 });
      dispatch(setProducts(response.data));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          borderRadius: 2,
          color: 'white',
          mb: 4,
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Последние объявления
        </Typography>

        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
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
                  <Typography gutterBottom variant="h6" component="div">
                    {product.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            </Grid>
          ))}
        </Grid>

        {!loading && products.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 8 }}>
            Нет доступных товаров
          </Typography>
        )}
      </Box>

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
