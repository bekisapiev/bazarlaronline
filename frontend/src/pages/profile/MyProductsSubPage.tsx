import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Storefront as StorefrontIcon } from '@mui/icons-material';
import BackButton from '../../components/profile/BackButton';
import WarehouseStatistics from '../../components/warehouse/WarehouseStatistics';
import { productsAPI } from '../../services/api';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  stock_quantity?: number;
  images: string[];
  status: string;
  created_at: string;
  views?: number;
  is_referral_enabled?: boolean;
  referral_commission_percent?: number;
  referral_commission_amount?: number;
}

const MyProductsSubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    loadMyProducts();
  }, []);

  const loadMyProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productsAPI.getMyProducts({
        limit: 20,
        offset: 0,
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setMyProducts(productsData);
    } catch (err: any) {
      console.error('Error loading my products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <BackButton title="Мои товары и услуги" />

      {/* Статистика склада - только для Business тарифа */}
      {user?.tariff === 'business' && !productsLoading && <WarehouseStatistics />}

      {productsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : myProducts.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <StorefrontIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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
            <Grid item xs={12} sm={6} md={6} lg={4} key={product.id}>
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

                  {/* Цена */}
                  <Box sx={{ mb: 1 }}>
                    {product.discount_price ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" fontWeight={600} color="primary">
                            {product.discount_price} сом
                          </Typography>
                          {product.discount_percent && (
                            <Chip
                              label={`-${product.discount_percent}%`}
                              color="error"
                              size="small"
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          {product.price} сом
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="h6" fontWeight={600} color="primary">
                        {product.price} сом
                      </Typography>
                    )}
                  </Box>

                  {/* Количество на складе */}
                  {product.stock_quantity !== undefined && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      На складе: <strong>{product.stock_quantity} шт</strong>
                    </Typography>
                  )}

                  {/* Реферальная комиссия */}
                  {product.is_referral_enabled && product.referral_commission_percent && (
                    <Box sx={{ mb: 1, p: 1, bgcolor: 'success.lighter', borderRadius: 1 }}>
                      <Typography variant="caption" color="success.dark" display="block" fontWeight={600}>
                        🎁 Реферальная программа
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Комиссия: {product.referral_commission_percent}%
                        {product.referral_commission_amount && (
                          <> ({(typeof product.referral_commission_amount === 'string'
                            ? parseFloat(product.referral_commission_amount)
                            : product.referral_commission_amount).toFixed(2)} сом)</>
                        )}
                      </Typography>
                    </Box>
                  )}

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
    </Container>
  );
};

export default MyProductsSubPage;
