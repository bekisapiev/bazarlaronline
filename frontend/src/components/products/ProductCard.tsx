import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addFavorite, removeFavorite } from '../../store/slices/favoritesSlice';
import { favoritesAPI } from '../../services/api';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    discount_price?: number;
    discount_percent?: number;
    images: string[];
    is_promoted?: boolean;
    is_service?: boolean;
    seller_name?: string;
    views_count?: number;
  };
  onProductClick?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { favoriteIds } = useSelector((state: RootState) => state.favorites);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const isFavorite = favoriteIds.has(product.id);

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setTogglingFavorite(true);

      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(product.id);
        dispatch(removeFavorite(product.id));
      } else {
        await favoritesAPI.addToFavorites(product.id);
        dispatch(
          addFavorite({
            id: product.id,
            title: product.title,
            price: product.price,
            discount_price: product.discount_price,
            images: product.images,
            seller_name: product.seller_name || 'Неизвестно',
            created_at: new Date().toISOString(),
          })
        );
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const calculateDiscount = () => {
    if (product.discount_price && product.price) {
      return Math.round(((product.price - product.discount_price) / product.price) * 100);
    }
    return product.discount_percent || 0;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleProductClick}
    >
      {/* Favorite Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
          zIndex: 1,
        }}
        onClick={handleToggleFavorite}
        disabled={togglingFavorite}
      >
        {togglingFavorite ? (
          <CircularProgress size={24} />
        ) : isFavorite ? (
          <FavoriteIcon color="error" />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>

      {/* Promoted Badge */}
      {product.is_promoted && (
        <Chip
          label="Продвигается"
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            fontWeight: 600,
          }}
        />
      )}

      {/* Product Image */}
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

      {/* Product Info */}
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
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          {product.title}
        </Typography>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
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
                label={`-${calculateDiscount()}%`}
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

        {/* Seller Name */}
        {product.seller_name && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Продавец: {product.seller_name}
          </Typography>
        )}

        {/* Views Count */}
        {product.views_count !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {product.views_count}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          size="small"
          color="primary"
          fullWidth
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            handleProductClick();
          }}
        >
          Посмотреть
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
