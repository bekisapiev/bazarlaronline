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
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addToCart, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { productsAPI, ordersAPI } from '../services/api';
import { getProductReferralCookie } from '../utils/referral';

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
  const dispatch = useDispatch();

  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart state
  const { sellerId: cartSellerId, items: cartItems, totalAmount } = useSelector((state: RootState) => state.cart);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Order form
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!seller) return;

    dispatch(addToCart({
      sellerId: seller.user_id,
      item: {
        productId: product.id,
        quantity: 1,
        price: product.price,
        discountPrice: product.discount_price,
      },
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      setError('Заполните адрес доставки и номер телефона');
      return;
    }

    setOrderLoading(true);
    setError('');

    try {
      const orderData = {
        seller_id: cartSellerId,
        items: cartItems.map(item => {
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
        phone: phoneNumber,
        notes: notes || undefined,
      };

      await ordersAPI.createOrder(orderData);

      setOrderSuccess(true);
      dispatch(clearCart());
      setDeliveryAddress('');
      setPhoneNumber('');
      setNotes('');

      setTimeout(() => {
        setOrderDialogOpen(false);
        setOrderSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания заказа');
    } finally {
      setOrderLoading(false);
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
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      onClick={(e) => handleAddToCart(product, e)}
                      sx={{ mt: 2 }}
                    >
                      В корзину
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(`/?seller=${seller.user_id}`)}
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

      {/* Floating Cart Button */}
      {cartItems.length > 0 && cartSellerId === seller?.user_id && (
        <IconButton
          color="primary"
          onClick={() => setCartOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' },
            boxShadow: 4,
            zIndex: 1000,
          }}
        >
          <Badge badgeContent={cartItems.length} color="error">
            <ShoppingCartIcon sx={{ fontSize: 32 }} />
          </Badge>
        </IconButton>
      )}

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>
              Корзина
            </Typography>
            <IconButton onClick={() => setCartOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {cartItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Корзина пуста
              </Typography>
            </Box>
          ) : (
            <>
              <List>
                {cartItems.map((item) => {
                  const product = seller?.products?.find(p => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <ListItem key={item.productId} sx={{ borderBottom: 1, borderColor: 'divider', pb: 2, mb: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {product.title}
                          </Typography>
                          <IconButton size="small" onClick={() => handleRemoveFromCart(item.productId)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.discountPrice || item.price} сом × {item.quantity}
                        </Typography>
                        <Typography variant="subtitle2" color="primary" fontWeight={600}>
                          Итого: {(item.discountPrice || item.price) * item.quantity} сом
                        </Typography>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Всего товаров:</Typography>
                  <Typography variant="h6">{cartItems.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight={600}>Итого:</Typography>
                  <Typography variant="h5" fontWeight={600} color="primary">
                    {totalAmount} сом
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => {
                  setCartOpen(false);
                  setOrderDialogOpen(true);
                }}
                sx={{ mb: 1 }}
              >
                Оформить заказ
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleClearCart}
              >
                Очистить корзину
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Оформление заказа</DialogTitle>
        <DialogContent>
          {orderSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Заказ успешно создан! Продавец свяжется с вами.
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Адрес доставки"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                margin="normal"
                required
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="Номер телефона"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                margin="normal"
                required
                placeholder="+996555123456"
              />

              <TextField
                fullWidth
                label="Примечания к заказу"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ваш заказ:
                </Typography>
                {cartItems.map((item) => {
                  const product = seller?.products?.find(p => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <Typography key={item.productId} variant="body2">
                      {product.title} × {item.quantity} = {(item.discountPrice || item.price) * item.quantity} сом
                    </Typography>
                  );
                })}
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Итого: {totalAmount} сом
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>
            {orderSuccess ? 'Закрыть' : 'Отмена'}
          </Button>
          {!orderSuccess && (
            <Button
              variant="contained"
              onClick={handlePlaceOrder}
              disabled={orderLoading}
            >
              {orderLoading ? 'Оформление...' : 'Подтвердить заказ'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerDetailPage;
