import React, { useEffect, useState, useCallback } from 'react';
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
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { favoritesAPI } from '../services/api';
import {
  setFavorites,
  removeFavorite,
  setLoading,
  setHasMore,
} from '../store/slices/favoritesSlice';

const FavoritesPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: favorites, loading, hasMore } = useSelector(
    (state: RootState) => state.favorites
  );

  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async (reset: boolean = false) => {
    try {
      setError(null);
      if (reset) {
        dispatch(setLoading(true));
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const params = {
        limit: 20,
        offset: reset ? 0 : (page - 1) * 20,
      };

      const response = await favoritesAPI.getFavorites(params);

      if (reset) {
        dispatch(setFavorites(response.data));
      } else {
        // Add new favorites to existing ones
        const currentFavorites = [...favorites, ...response.data];
        dispatch(setFavorites(currentFavorites));
      }

      dispatch(setHasMore(response.data.length === 20));

      if (!reset) {
        setPage(page + 1);
      }
    } catch (err: any) {
      console.error('Error loading favorites:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить избранное');
    } finally {
      dispatch(setLoading(false));
      setLoadingMore(false);
    }
  }, [dispatch, favorites, page]);

  useEffect(() => {
    loadFavorites(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveFavorite = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setRemovingIds(new Set(removingIds).add(productId));
      await favoritesAPI.removeFromFavorites(productId);
      dispatch(removeFavorite(productId));
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      setError(err.response?.data?.detail || 'Не удалось удалить из избранного');
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadFavorites(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Избранное
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {favorites.length > 0
            ? `${favorites.length} товар${favorites.length === 1 ? '' : favorites.length < 5 ? 'а' : 'ов'}`
            : 'Нет избранных товаров'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : favorites.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            backgroundColor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <FavoriteBorder sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Нет избранных товаров
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Добавьте товары в избранное, чтобы быстро находить их позже
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {favorites.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 },
                  }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'white',
                      '&:hover': { backgroundColor: 'white' },
                      zIndex: 1,
                    }}
                    onClick={(e) => handleRemoveFavorite(product.id, e)}
                    disabled={removingIds.has(product.id)}
                  >
                    {removingIds.has(product.id) ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Favorite color="error" />
                    )}
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="250"
                    image={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : 'https://via.placeholder.com/350'
                    }
                    alt={product.title}
                    sx={{ objectFit: 'cover' }}
                  />

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '3.6em',
                      }}
                    >
                      {product.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                            label={`-${Math.round(
                              ((product.price - product.discount_price) / product.price) * 100
                            )}%`}
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

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Продавец: {product.seller_name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Добавлено: {formatDate(product.created_at)}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      color="primary"
                      fullWidth
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                    >
                      Посмотреть
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleLoadMore}
                disabled={loadingMore}
                startIcon={loadingMore && <CircularProgress size={20} />}
              >
                {loadingMore ? 'Загрузка...' : 'Загрузить еще'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default FavoritesPage;
