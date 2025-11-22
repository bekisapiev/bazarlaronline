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
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  productsAPI,
  favoritesAPI,
  reviewsAPI,
  recommendationsAPI,
} from '../services/api';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    full_name: string;
    avatar?: string;
    rating: number;
  };
  location?: string;
  is_promoted: boolean;
  created_at: string;
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

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
      loadSimilarProducts();
      if (isAuthenticated) {
        checkFavoriteStatus();
        recordView();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

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

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    alert('Добавлено в корзину!');
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
          <Button sx={{ mt: 2 }} onClick={() => navigate('/products')}>
            Вернуться к списку товаров
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
          <Link component={RouterLink} to="/products" underline="hover" color="inherit">
            Товары
          </Link>
          {product.category && (
            <Link
              component={RouterLink}
              to={`/products?category=${product.category.slug}`}
              underline="hover"
              color="inherit"
            >
              {product.category.name}
            </Link>
          )}
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
              {product.is_promoted && (
                <Chip label="Поднято" color="primary" size="small" sx={{ mb: 2 }} />
              )}

              <Typography variant="h4" gutterBottom fontWeight={700}>
                {product.title}
              </Typography>

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

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  sx={{ flexGrow: 1 }}
                >
                  Добавить в корзину
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
                <IconButton sx={{ border: 1, borderColor: 'grey.300' }}>
                  <Share />
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
                    Продавец
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar src={product.seller.avatar} sx={{ width: 56, height: 56 }}>
                      <Store />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {product.seller.full_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={product.seller.rating || 0} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                          {(product.seller.rating || 0).toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/sellers/${product.seller.id}`)}
                  >
                    Посмотреть профиль продавца
                  </Button>
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

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
              Похожие товары
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
              {similarProducts.map((product) => (
                <Box key={product.id} sx={{ flexShrink: 0, width: 250 }}>
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
                      height="200"
                      image={product.images?.[0] || 'https://via.placeholder.com/350'}
                      alt={product.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {product.title}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {product.discount_price || product.price} сом
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
    </Container>
  );
};

export default ProductDetailPage;
