import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCartOutlined as EmptyCartIcon,
  LocalShipping as ShippingIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeFromCart, clearCart } from '../store/slices/cartSlice';
import { productsAPI, ordersAPI } from '../services/api';
import { getProductReferralCookie } from '../utils/referral';

interface CartProduct {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images?: string[];
  seller: {
    id: string;
    shop_name: string;
    phone?: string;
  };
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sellerId, items, totalAmount, totalQuantity } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [products, setProducts] = useState<Record<string, CartProduct>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Order form state
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadProductDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const productDetails: Record<string, CartProduct> = {};

      // Fetch each product's details
      for (const item of items) {
        try {
          const response = await productsAPI.getProductById(item.productId);
          productDetails[item.productId] = response.data;
        } catch (err) {
          console.error(`Failed to load product ${item.productId}:`, err);
        }
      }

      setProducts(productDetails);
    } catch (err: any) {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Load product details for cart items
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (items.length > 0) {
      loadProductDetails();
    } else {
      setLoading(false);
    }
  }, [items, isAuthenticated, loadProductDetails, navigate]);

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    if (window.confirm('Очистить корзину?')) {
      dispatch(clearCart());
      setProducts({});
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!deliveryAddress.trim()) {
      errors.deliveryAddress = 'Укажите адрес доставки';
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Укажите номер телефона';
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/[\s-]/g, ''))) {
      errors.phoneNumber = 'Неверный формат номера телефона';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setOrderLoading(true);
    setError('');

    try {
      // Get product referral data from cookies for each item
      const orderData = {
        seller_id: sellerId,
        items: items.map(item => {
          const referralData = getProductReferralCookie(item.productId);
          return {
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount_price: item.discountPrice || undefined,
            product_referrer_id: referralData?.referrerId || undefined,
          };
        }),
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        notes: notes || undefined,
        payment_method: 'wallet',
      };

      await ordersAPI.createOrder(orderData);

      setOrderSuccess(true);
      dispatch(clearCart());

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при оформлении заказа');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Главная
          </MuiLink>
          <Typography color="text.primary">Корзина</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <EmptyCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Корзина пуста
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Добавьте товары в корзину, чтобы оформить заказ
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
          >
            Перейти к покупкам
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Корзина</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Корзина ({totalQuantity})
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClearCart}
        >
          Очистить корзину
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {orderSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Заказ успешно оформлен! Перенаправление...
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Товары
            </Typography>

            {items.map((item) => {
              const product = products[item.productId];
              if (!product) return null;

              const itemTotal = (item.discountPrice || item.price) * item.quantity;

              return (
                <Card
                  key={item.productId}
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', p: 2 }}
                  elevation={0}
                  variant="outlined"
                >
                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                    image={product.images?.[0] || '/placeholder.png'}
                    alt={product.title}
                  />

                  {/* Product Info */}
                  <CardContent sx={{ flex: 1, py: 0 }}>
                    <Typography
                      variant="h6"
                      component={Link}
                      to={`/products/${product.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
                    >
                      {product.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Продавец: {product.seller.shop_name}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      {item.discountPrice || item.price} сом
                    </Typography>
                  </CardContent>

                  {/* Quantity Controls */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <IconButton size="small" disabled>
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton size="small" disabled>
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Всего: {itemTotal} сом
                    </Typography>
                  </Box>

                  {/* Remove Button */}
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              );
            })}
          </Paper>
        </Grid>

        {/* Order Summary and Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Итого
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Товары ({totalQuantity}):</Typography>
              <Typography>{totalAmount} сом</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">К оплате:</Typography>
              <Typography variant="h6" color="primary">
                {totalAmount} сом
              </Typography>
            </Box>
          </Paper>

          {/* Delivery Form */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Оформление заказа
            </Typography>
            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              label="Адрес доставки"
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                setFormErrors({ ...formErrors, deliveryAddress: '' });
              }}
              error={!!formErrors.deliveryAddress}
              helperText={formErrors.deliveryAddress}
              placeholder="Улица, дом, квартира"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Номер телефона"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setFormErrors({ ...formErrors, phoneNumber: '' });
              }}
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              placeholder="+996 XXX XXX XXX"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Примечания к заказу"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Комментарий для продавца (необязательно)"
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShippingIcon />}
              onClick={handlePlaceOrder}
              disabled={orderLoading || orderSuccess}
            >
              {orderLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Оформить заказ'
              )}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Нажимая кнопку, вы соглашаетесь с условиями оплаты и доставки
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
