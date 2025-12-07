import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Inventory as InventoryIcon, Handshake as HandshakeIcon } from '@mui/icons-material';
import BackButton from '../../components/profile/BackButton';
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

const ReservedProductsSubPage: React.FC = () => {
  const navigate = useNavigate();
  const [partnerProducts, setPartnerProducts] = useState<Product[]>([]);
  const [partnerProductsLoading, setPartnerProductsLoading] = useState(false);

  useEffect(() => {
    loadPartnerProducts();
  }, []);

  const loadPartnerProducts = async () => {
    try {
      setPartnerProductsLoading(true);
      const response = await productsAPI.getReferralProducts({
        limit: 50,
        offset: 0,
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setPartnerProducts(productsData);
    } catch (err: any) {
      console.error('Error loading referral products:', err);
    } finally {
      setPartnerProductsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <BackButton title="Реферальные товары" />

      {partnerProductsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : partnerProducts.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <HandshakeIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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
        <Box>
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.50' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Как зарабатывать?
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

          <Grid container spacing={3}>
            {partnerProducts.map((product) => (
              <Grid item xs={12} sm={6} key={product.id}>
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

                    <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Ваша комиссия (45% от общей):
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600} color="success.main">
                        {(() => {
                          const partnerAmount = (product.referral_commission_amount || 0) * 0.45;
                          const partnerPercent = (product.referral_commission_percent || 0) * 0.45;
                          const sellerPercent = product.referral_commission_percent || 0;
                          return `${partnerAmount.toFixed(2)} сом (${partnerPercent.toFixed(1)}% от ${sellerPercent}%)`;
                        })()}
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
        </Box>
      )}
    </Container>
  );
};

export default ReservedProductsSubPage;
