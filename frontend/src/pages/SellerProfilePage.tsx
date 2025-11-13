import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Rating,
  Tabs,
  Tab,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Store,
  Verified,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  Star,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { productsAPI, reviewsAPI, usersAPI } from '../services/api';
import { addToCart } from '../store/slices/cartSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface SellerProfile {
  id: string;
  shop_name: string;
  description: string;
  banner_url?: string;
  logo_url?: string;
  category: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  seller_type: string;
  market?: {
    id: number;
    name: string;
  };
  address?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviews_count: number;
  products_count: number;
  is_verified: boolean;
  tariff: string;
  phone?: string;
  email?: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  images?: string[];
  is_promoted: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    full_name: string;
    avatar?: string;
  };
  created_at: string;
  seller_response?: string;
}

const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      loadSellerProfile();
      loadSellerProducts();
      loadSellerReviews();
    }
  }, [id]);

  const loadSellerProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.getSellerProfile(id!);
      // Handle different response formats
      const sellerData = response.data?.seller || response.data;
      setSeller(sellerData);
    } catch (err: any) {
      console.error('Error loading seller profile:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки профиля продавца');
      setSeller(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ seller_id: id, page: 1, page_size: 12 });
      // Handle different response formats
      let productsData: Product[] = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        productsData = response.data.items;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      }
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
    }
  };

  const loadSellerReviews = async () => {
    try {
      const response = await reviewsAPI.getSellerReviews(id!, { limit: 10, offset: 0 });
      // Handle different response formats
      let reviewsData: Review[] = [];
      if (Array.isArray(response.data)) {
        reviewsData = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        reviewsData = response.data.items;
      } else if (response.data?.reviews && Array.isArray(response.data.reviews)) {
        reviewsData = response.data.reviews;
      }
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!seller) return;
    dispatch(addToCart({
      sellerId: seller.id,
      item: {
        productId: product.id,
        quantity: 1,
        price: product.price,
        discountPrice: product.discount_price,
      },
    }));
  };

  const handleToggleFavorite = (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavoriteIds(newFavorites);
  };

  const getSellerTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      market: 'Рынок',
      boutique: 'Бутик',
      shop: 'Магазин',
      office: 'Офис',
      home: 'Дома',
      mobile: 'На выезд',
      warehouse: 'Склад',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !seller) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Продавец не найден'}</Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Banner */}
      <Box
        sx={{
          height: 300,
          backgroundImage: seller.banner_url
            ? `url(${seller.banner_url})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Logo overlay on banner */}
        <Container maxWidth="lg">
          <Avatar
            src={seller.logo_url}
            sx={{
              width: 100,
              height: 100,
              position: 'absolute',
              bottom: -50,
              left: 24,
              border: '4px solid white',
              boxShadow: 3,
            }}
          >
            <Store sx={{ fontSize: 50 }} />
          </Avatar>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 8 }}>
        {/* Seller Info Block */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h4" fontWeight={600}>
                  {seller.shop_name}
                </Typography>
                {seller.is_verified && (
                  <Verified color="primary" sx={{ fontSize: 32 }} />
                )}
                <Chip
                  label={seller.tariff.toUpperCase()}
                  color={seller.tariff === 'business' ? 'success' : seller.tariff === 'pro' ? 'primary' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip icon={<LocationOn />} label={seller.city.name} />
                <Chip label={getSellerTypeLabel(seller.seller_type)} variant="outlined" />
                {seller.market && <Chip label={seller.market.name} variant="outlined" />}
                <Chip label={seller.category.name} color="primary" variant="outlined" />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Rating value={seller.rating} precision={0.1} readOnly />
                <Typography variant="body1" color="text.secondary">
                  {seller.rating.toFixed(1)} ({seller.reviews_count} отзывов)
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {seller.description}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Товаров: {seller.products_count}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={() => setActiveTab(0)}
                  fullWidth
                >
                  Смотреть товары
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Share />}
                  fullWidth
                >
                  Поделиться
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`Товары (${products.length})`} />
            <Tab label="О продавце" />
            <Tab label={`Отзывы (${reviews.length})`} />
            <Tab label="Контакты" />
          </Tabs>

          {/* Tab 0: Products */}
          <TabPanel value={activeTab} index={0}>
            {!Array.isArray(products) || products.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Нет товаров</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {Array.isArray(products) && products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        '&:hover': { boxShadow: 6 },
                      }}
                    >
                      {product.discount_percent && (
                        <Chip
                          label={`-${product.discount_percent}%`}
                          color="error"
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                        />
                      )}

                      <IconButton
                        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, bgcolor: 'white' }}
                        onClick={() => handleToggleFavorite(product.id)}
                      >
                        {favoriteIds.has(product.id) ? <Favorite color="error" /> : <FavoriteBorder />}
                      </IconButton>

                      <CardMedia
                        component="img"
                        height="200"
                        image={product.images && Array.isArray(product.images) && product.images[0] ? product.images[0] : '/placeholder.png'}
                        alt={product.title}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/products/${product.id}`)}
                      />

                      <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(`/products/${product.id}`)}>
                        <Typography variant="h6" noWrap gutterBottom>
                          {product.title}
                        </Typography>

                        <Box>
                          {product.discount_price ? (
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textDecoration: 'line-through', display: 'inline', mr: 1 }}
                              >
                                {product.price} сом
                              </Typography>
                              <Typography variant="h6" color="error" sx={{ display: 'inline', fontWeight: 600 }}>
                                {product.discount_price} сом
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="h6" color="primary" fontWeight={600}>
                              {product.price} сом
                            </Typography>
                          )}
                        </Box>
                      </CardContent>

                      <CardActions>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                        >
                          В корзину
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Tab 1: About */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              О продавце
            </Typography>
            <Typography paragraph>
              {seller.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Информация
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Категория"
                  secondary={seller.category.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Тип"
                  secondary={getSellerTypeLabel(seller.seller_type)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Город"
                  secondary={seller.city.name}
                />
              </ListItem>
              {seller.market && (
                <ListItem>
                  <ListItemText
                    primary="Рынок"
                    secondary={seller.market.name}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText
                  primary="Тарифный план"
                  secondary={seller.tariff.toUpperCase()}
                />
              </ListItem>
            </List>
          </TabPanel>

          {/* Tab 2: Reviews */}
          <TabPanel value={activeTab} index={2}>
            {!Array.isArray(reviews) || reviews.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Пока нет отзывов</Typography>
              </Box>
            ) : (
              <List>
                {Array.isArray(reviews) && reviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={review.user.avatar}>
                          {review.user.full_name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {review.user.full_name}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </Typography>
                            <Typography variant="body1" paragraph>
                              {review.comment}
                            </Typography>
                            {review.seller_response && (
                              <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                  Ответ продавца:
                                </Typography>
                                <Typography variant="body2">
                                  {review.seller_response}
                                </Typography>
                              </Paper>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </TabPanel>

          {/* Tab 3: Contacts */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Контактная информация
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <LocationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Адрес"
                      secondary={seller.address || `${seller.city.name}${seller.market ? `, ${seller.market.name}` : ''}`}
                    />
                  </ListItem>
                  {seller.phone && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Phone />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Телефон"
                        secondary={seller.phone}
                      />
                    </ListItem>
                  )}
                  {seller.email && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <Email />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Email"
                        secondary={seller.email}
                      />
                    </ListItem>
                  )}
                </List>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/chat')}
                  sx={{ mt: 2 }}
                >
                  Написать продавцу
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Расположение на карте
                </Typography>
                <Paper sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                  <Typography color="text.secondary">
                    Карта (интеграция с картами)
                  </Typography>
                  {seller.latitude && seller.longitude && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({seller.latitude.toFixed(6)}, {seller.longitude.toFixed(6)})
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default SellerProfilePage;
