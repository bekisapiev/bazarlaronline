import React, { useEffect, useState, useCallback } from 'react';
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
  Rating,
  Avatar,
  Divider,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  LocationOn,
  Store,
  Share,
  NavigateNext,
  Star,
  ContentCopy,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  productsAPI,
  favoritesAPI,
  reviewsAPI,
  recommendationsAPI,
  usersAPI,
} from '../services/api';
import { handleProductReferralCode } from '../utils/referral';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  images: string[];
  category: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  seller: {
    id: string;
    full_name: string;
    avatar?: string;
    tariff: string;
    shop_name: string;
    seller_type: string;
    city_name: string | null;
    market_name: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    logo_url: string | null;
    rating: number;
    reviews_count: number;
  };
  views_count: number;
  location?: string;
  is_promoted: boolean;
  created_at: string;
  is_referral_enabled: boolean;
  referral_commission_percent?: number;
  referral_commission_amount?: number;
  product_type: 'product' | 'service';
  stock_quantity?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    full_name: string;
    avatar?: string;
  };
  created_at: string;
  seller_response?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sellerTariff, setSellerTariff] = useState<string | null>(null);
  const [partnerLink, setPartnerLink] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [userReferralId, setUserReferralId] = useState<string | null>(null);
  const [productReferralLink, setProductReferralLink] = useState<string>('');
  const [outOfStockNotification, setOutOfStockNotification] = useState(false);

  // Order modal state
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderAddress, setOrderAddress] = useState('');
  const [orderDateTime, setOrderDateTime] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getProductById(id!);
      setProduct(response.data);
    } catch (error: any) {
      console.error('Error loading product:', error);
      if (error.response?.status === 404) {
        setError('Товар не найден');
      } else {
        setError('Ошибка загрузки товара');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    try {
      const response = await reviewsAPI.getProductReviews(id!, { limit: 10, offset: 0 });
      const reviewsData = response.data.items || response.data;
      setReviews(reviewsData);

      // Calculate average rating
      if (reviewsData.length > 0) {
        const sum = reviewsData.reduce((acc: number, review: Review) => acc + review.rating, 0);
        setAverageRating(sum / reviewsData.length);
        setTotalReviews(reviewsData.length);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }, [id]);

  const loadSimilarProducts = useCallback(async () => {
    try {
      const response = await recommendationsAPI.getSimilarProducts(id!, 8);
      setSimilarProducts(response.data.items || response.data);
    } catch (error) {
      console.error('Error loading similar products:', error);
    }
  }, [id]);

  const loadSellerProducts = useCallback(async (sellerId: string) => {
    try {
      const response = await productsAPI.getProducts({
        seller_id: sellerId,
        limit: 8,
        offset: 0,
      });
      // Filter out current product
      const otherProducts = (response.data.items || response.data).filter(
        (p: any) => p.id !== id
      );
      setSellerProducts(otherProducts);
    } catch (error) {
      console.error('Error loading seller products:', error);
    }
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await favoritesAPI.checkFavorite(id!);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [id]);

  const recordView = useCallback(async () => {
    try {
      await favoritesAPI.recordView(id!);
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }, [id]);

  const loadSellerInfo = useCallback(async (sellerId: string) => {
    try {
      // Get seller profile to check tariff
      const sellerResponse = await productsAPI.getSellerById(sellerId, false);
      const sellerData = sellerResponse.data;

      if (sellerData.user?.tariff) {
        setSellerTariff(sellerData.user.tariff);

        // If seller has Business tariff, generate partner link for this product
        if (sellerData.user.tariff === 'business' && sellerData.user.referral_id) {
          const baseUrl = window.location.origin;
          // Create partner link pointing to this product with seller's ref code
          const link = `${baseUrl}/products/${id}?ref=${sellerData.user.referral_id}`;
          setPartnerLink(link);
        }
      }
    } catch (error) {
      console.error('Error loading seller info:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
      if (isAuthenticated) {
        checkFavoriteStatus();
        recordView();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  // Load seller products or similar products based on tariff
  useEffect(() => {
    if (product?.seller) {
      if (product.seller.tariff === 'pro' || product.seller.tariff === 'business') {
        loadSellerProducts(product.seller.id);
      } else {
        loadSimilarProducts();
      }
    }
  }, [product, loadSellerProducts, loadSimilarProducts]);

  // Load seller info when product is loaded
  useEffect(() => {
    if (product?.seller?.id) {
      loadSellerInfo(product.seller.id);
    }
  }, [product, loadSellerInfo]);

  // Handle product referral code from URL
  useEffect(() => {
    if (id && product) {
      // Check if product has stock available (for products, not services)
      if (product.product_type === 'product' && product.stock_quantity !== undefined && product.stock_quantity <= 0) {
        // Show notification and redirect to home if out of stock
        setOutOfStockNotification(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
        return;
      }

      const referralData = handleProductReferralCode(id);
      if (referralData) {
        console.log('Product referral saved:', referralData);
      }
    }
  }, [id, product, navigate]);

  // Load user referral ID for sharing
  useEffect(() => {
    const loadUserReferralId = async () => {
      if (isAuthenticated) {
        try {
          const response = await usersAPI.getReferralLink();
          setUserReferralId(response.data.referral_code);

          // Generate product referral link if product has referral program enabled
          if (product?.is_referral_enabled && id) {
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/products/${id}?ref=${response.data.referral_code}`;
            setProductReferralLink(link);
          }
        } catch (err) {
          console.error('Error loading user referral ID:', err);
        }
      }
    };

    loadUserReferralId();
  }, [isAuthenticated, product, id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(id!);
        setIsFavorite(false);
      } else {
        await favoritesAPI.addToFavorites(id!);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleOpenOrderDialog = () => {
    setOrderDialogOpen(true);
  };

  const handleSubmitOrder = async () => {
    const isService = product?.product_type === 'service';

    if (!orderPhone.trim()) {
      alert('Пожалуйста, укажите номер телефона');
      return;
    }

    if (!isService && !orderAddress.trim()) {
      alert('Пожалуйста, укажите адрес доставки');
      return;
    }

    if (isService && !orderDateTime.trim()) {
      alert('Пожалуйста, укажите дату и время записи');
      return;
    }

    setSubmittingOrder(true);
    try {
      // TODO: Implement actual order API call
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`${isService ? 'Запись' : 'Заказ'} успешно оформлен!\nПродавец свяжется с вами по телефону ${orderPhone}`);
      setOrderDialogOpen(false);
      setOrderName('');
      setOrderPhone('');
      setOrderNotes('');
      setOrderQuantity(1);
      setOrderAddress('');
      setOrderDateTime('');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Ошибка при оформлении заказа');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewsAPI.createReview({
        product_id: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewDialogOpen(false);
      setReviewComment('');
      setReviewRating(5);
      loadReviews(); // Reload reviews
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.detail || 'Ошибка отправки отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Товар не найден'}</Alert>
          <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>
            Вернуться на главную
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Главная
          </Link>
          {product.category && product.category.length > 0 && product.category.map((cat, index) => (
            <Link
              key={cat.id}
              component={RouterLink}
              to={`/?category=${cat.slug}`}
              underline="hover"
              color="inherit"
            >
              {cat.name}
            </Link>
          ))}
          <Typography color="text.primary">{product.title}</Typography>
        </Breadcrumbs>

        {/* Product Details */}
        <Grid container spacing={4}>
          {/* Left Column - Images */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                image={product.images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.title}
                sx={{ height: 500, objectFit: 'cover' }}
              />
            </Card>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                      borderRadius: 1,
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Right Column - Details */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {product.is_promoted && (
                  <Chip label="Поднято" color="primary" size="small" />
                )}
                <Chip
                  label={product.product_type === 'product' ? 'Товар' : 'Услуга'}
                  size="small"
                  color={product.product_type === 'product' ? 'primary' : 'secondary'}
                />
              </Box>

              <Typography variant="h4" gutterBottom fontWeight={700}>
                {product.title}
              </Typography>

              {/* Views and Date */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  👁 {product.views_count} просмотров
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 {new Date(product.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Typography>
              </Box>

              {/* Location Info */}
              {product.seller.city_name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {product.seller.city_name}
                    {product.seller.market_name && `, ${product.seller.market_name}`}
                  </Typography>
                </Box>
              )}

              {/* Rating */}
              {totalReviews > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Rating value={averageRating} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({totalReviews} {totalReviews === 1 ? 'отзыв' : 'отзывов'})
                  </Typography>
                </Box>
              )}

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                {product.discount_price ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography
                        variant="h5"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        {product.price} сом
                      </Typography>
                      <Chip
                        label={`-${product.discount_percent}%`}
                        color="secondary"
                        size="medium"
                      />
                    </Box>
                    <Typography variant="h3" color="secondary.main" fontWeight={700}>
                      {product.discount_price} сом
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h3" fontWeight={700}>
                    {product.price} сом
                  </Typography>
                )}
              </Box>

              {/* Referral Commission Info */}
              {product.is_referral_enabled && product.referral_commission_amount && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label="Реферальная программа"
                      color="success"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Поделитесь ссылкой и получите комиссию партнера:
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="success.main">
                    {product.referral_commission_amount} сом (45%)
                  </Typography>
                  {productReferralLink && isAuthenticated && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={productReferralLink}
                        InputProps={{
                          readOnly: true,
                          sx: { fontSize: '0.875rem', bgcolor: 'white' }
                        }}
                      />
                      <IconButton
                        color="success"
                        onClick={() => {
                          navigator.clipboard.writeText(productReferralLink);
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 2000);
                        }}
                        sx={{ border: 1, borderColor: 'success.main' }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                  )}
                  {!isAuthenticated && (
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/login')}
                    >
                      Войдите, чтобы делиться ссылкой
                    </Button>
                  )}
                </Paper>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleOpenOrderDialog}
                  sx={{ flexGrow: 1 }}
                >
                  {product.product_type === 'service' ? 'Записаться' : 'Заказать'}
                </Button>
                <IconButton
                  onClick={toggleFavorite}
                  sx={{
                    border: 1,
                    borderColor: 'grey.300',
                    color: isFavorite ? 'error.main' : 'inherit',
                  }}
                >
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Описание
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Seller Info */}
              {product.seller && (
                <>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Информация о продавце
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'grey.200' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        src={product.seller.logo_url || product.seller.avatar}
                        sx={{ width: 64, height: 64 }}
                      >
                        <Store />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {product.seller.shop_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Rating value={product.seller.rating || 0} size="small" readOnly />
                          <Typography variant="body2" color="text.secondary">
                            {(product.seller.rating || 0).toFixed(1)} ({product.seller.reviews_count} отзывов)
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Тип: {
                            product.seller.seller_type === 'shop' ? 'Магазин' :
                            product.seller.seller_type === 'market' ? 'Рынок' :
                            product.seller.seller_type === 'boutique' ? 'Бутик' :
                            product.seller.seller_type === 'office' ? 'Офис' :
                            product.seller.seller_type === 'home' ? 'На дому' :
                            product.seller.seller_type === 'mobile' ? 'Выездная' :
                            product.seller.seller_type === 'warehouse' ? 'Склад' :
                            product.seller.seller_type
                          }
                        </Typography>
                      </Box>
                    </Box>

                    {product.seller.city_name && (
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {product.seller.city_name}
                            {product.seller.market_name && ` • ${product.seller.market_name}`}
                          </Typography>
                        </Box>
                        {product.seller.address && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                            {product.seller.address}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Map if coordinates available */}
                    {product.seller.latitude && product.seller.longitude && (
                      <Box sx={{ mb: 1 }}>
                        <a
                          href={`https://www.google.com/maps?q=${product.seller.latitude},${product.seller.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<LocationOn />}
                            sx={{ textTransform: 'none' }}
                          >
                            Показать на карте
                          </Button>
                        </a>
                      </Box>
                    )}

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/sellers/${product.seller.id}`)}
                      sx={{ mt: 1 }}
                    >
                      Посмотреть профиль продавца
                    </Button>
                  </Paper>
                </>
              )}

              {/* Partner Link for Business Tariff */}
              {sellerTariff === 'business' && partnerLink && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Партнерская ссылка
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Поделитесь этой ссылкой и получайте бонусы с покупок по вашей реферальной программе
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={partnerLink}
                        InputProps={{
                          readOnly: true,
                          sx: { fontSize: '0.875rem' }
                        }}
                      />
                      <IconButton
                        color="primary"
                        onClick={() => {
                          navigator.clipboard.writeText(partnerLink);
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 2000);
                        }}
                        sx={{ border: 1, borderColor: 'primary.main' }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                    {copySuccess && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                        Ссылка скопирована в буфер обмена!
                      </Typography>
                    )}
                  </Paper>
                </>
              )}

              {/* Location */}
              {product.location && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="action" />
                    <Typography variant="body1">{product.location}</Typography>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Reviews Section */}
        <Box sx={{ mt: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Отзывы ({totalReviews})
            </Typography>
            {isAuthenticated && (
              <Button
                variant="contained"
                startIcon={<Star />}
                onClick={() => setReviewDialogOpen(true)}
              >
                Написать отзыв
              </Button>
            )}
          </Box>

          {/* Overall Rating */}
          {totalReviews > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Typography variant="h2" fontWeight={700}>
                    {averageRating.toFixed(1)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Rating value={averageRating} precision={0.1} readOnly size="large" />
                  <Typography variant="body2" color="text.secondary">
                    Основано на {totalReviews} {totalReviews === 1 ? 'отзыве' : 'отзывах'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Reviews List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reviews.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                Пока нет отзывов. Будьте первым!
              </Typography>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                      <Avatar src={review.user?.avatar}>
                        {review.user?.full_name?.[0] || 'U'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {review.user?.full_name || 'Аноним'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.created_at).toLocaleDateString('ru-RU')}
                          </Typography>
                        </Box>
                        <Rating value={review.rating} size="small" readOnly sx={{ mb: 1 }} />
                        <Typography variant="body1" paragraph>
                          {review.comment}
                        </Typography>
                        {review.seller_response && (
                          <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Ответ продавца:
                            </Typography>
                            <Typography variant="body2">
                              {review.seller_response}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Box>

        {/* Related Products - Seller Products or Similar Products */}
        {(product?.seller.tariff === 'pro' || product?.seller.tariff === 'business') ? (
          // Show seller's other products for Pro/Business sellers
          sellerProducts.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Другие товары продавца
              </Typography>
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
                {sellerProducts.map((prod) => (
                  <Box key={prod.id} sx={{ flexShrink: 0, width: 250 }}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 },
                      }}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={prod.images?.[0] || 'https://via.placeholder.com/350'}
                        alt={prod.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {prod.title}
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {prod.discount_price || prod.price} сом
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary" fullWidth>
                          Посмотреть
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          )
        ) : (
          // Show similar products for Free sellers
          similarProducts.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Похожие товары и услуги
              </Typography>
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
                {similarProducts.map((prod) => (
                  <Box key={prod.id} sx={{ flexShrink: 0, width: 250 }}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 },
                      }}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={prod.images?.[0] || 'https://via.placeholder.com/350'}
                        alt={prod.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {prod.title}
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {prod.discount_price || prod.price} сом
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary" fullWidth>
                          Посмотреть
                        </Button>
                      </CardActions>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          )
        )}
      </Box>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Написать отзыв</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>Оценка</Typography>
            <Rating
              value={reviewRating}
              onChange={(_, newValue) => setReviewRating(newValue || 5)}
              size="large"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Ваш отзыв"
              multiline
              rows={4}
              fullWidth
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Поделитесь своим опытом использования этого товара..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={submittingReview || !reviewComment.trim()}
          >
            {submittingReview ? <CircularProgress size={24} /> : 'Отправить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {product?.product_type === 'service' ? 'Запись на услугу' : 'Оформление заказа'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {product?.product_type === 'service'
                ? 'Заполните данные для записи, и продавец свяжется с вами для подтверждения'
                : 'Заполните контактные данные, и продавец свяжется с вами для уточнения деталей заказа'}
            </Typography>

            {product?.product_type === 'service' ? (
              <>
                {/* Service form fields */}
                <TextField
                  label="Дата и время записи"
                  type="datetime-local"
                  fullWidth
                  required
                  value={orderDateTime}
                  onChange={(e) => setOrderDateTime(e.target.value)}
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  label="Номер телефона"
                  fullWidth
                  required
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="0555 00 00 00"
                />

                <TextField
                  label="Примечания или комментарий"
                  multiline
                  rows={3}
                  fullWidth
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Укажите дополнительные пожелания (необязательно)"
                />
              </>
            ) : (
              <>
                {/* Product form fields */}
                <TextField
                  label="Количество"
                  type="number"
                  fullWidth
                  required
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 1 }}
                />

                <TextField
                  label="Адрес доставки"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  value={orderAddress}
                  onChange={(e) => setOrderAddress(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="Введите адрес доставки"
                />

                <TextField
                  label="Номер телефона"
                  fullWidth
                  required
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="0555 00 00 00"
                />

                <TextField
                  label="Примечания или комментарий"
                  multiline
                  rows={3}
                  fullWidth
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Укажите дополнительные пожелания (необязательно)"
                />
              </>
            )}

            {product && (
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.product_type === 'service' ? 'Услуга:' : 'Товар:'}
                </Typography>
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {product.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {product.discount_price || product.price} сом
                    {product.product_type !== 'service' && orderQuantity > 1 && ` × ${orderQuantity}`}
                  </Typography>
                  {product.product_type !== 'service' && orderQuantity > 1 && (
                    <Typography variant="h5" fontWeight={600} color="primary">
                      = {(product.discount_price || product.price) * orderQuantity} сом
                    </Typography>
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSubmitOrder}
            variant="contained"
            disabled={submittingOrder || !orderPhone.trim()}
          >
            {submittingOrder ? <CircularProgress size={24} /> : product?.product_type === 'service' ? 'Записаться' : 'Отправить заказ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Скопировано!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Out of Stock Notification */}
      <Snackbar
        open={outOfStockNotification}
        autoHideDuration={2000}
        onClose={() => setOutOfStockNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setOutOfStockNotification(false)}>
          Товары на складе не осталось, посмотрите другие товары для заказа.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetailPage;
