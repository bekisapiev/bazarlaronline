import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Drawer,
  IconButton,
  Slider,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  FavoriteBorder as FavoriteIcon,
  Favorite as FavoriteFilledIcon,
  ShoppingCart as CartIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { productsAPI, categoriesAPI } from '../services/api';
import { toggleFavorite } from '../store/slices/favoritesSlice';
import { addToCart } from '../store/slices/cartSlice';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  images?: string[];
  is_promoted: boolean;
  seller: {
    id: string;
    shop_name: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favoriteIds } = useSelector((state: RootState) => state.favorites);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page,
        page_size: 24,
        sort_by: sortBy,
      };

      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (priceRange[0] > 0) params.min_price = priceRange[0];
      if (priceRange[1] < 100000) params.max_price = priceRange[1];

      const response = await productsAPI.getProducts(params);
      setProducts(response.data.items);
      setTotalPages(response.data.total_pages);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, categoryId, priceRange]);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, search, categoryId, priceRange]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories({ parent_id: null });
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else {
        console.warn('Unexpected categories data format:', response.data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]); // Set to empty array on error
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts();
    updateURL();
  };

  const handleFilterChange = (filter: string, value: any) => {
    setPage(1);
    if (filter === 'category') setCategoryId(value);
    if (filter === 'sort') setSortBy(value);
    updateURL();
  };

  const updateURL = () => {
    const params: any = {};
    if (search) params.search = search;
    if (categoryId) params.category = categoryId;
    if (sortBy !== 'created_at') params.sort = sortBy;
    if (page > 1) params.page = page.toString();
    setSearchParams(params);
  };

  const handleToggleFavorite = (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleFavorite({ id: productId }));
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      sellerId: product.seller.id,
      item: {
        productId: product.id,
        quantity: 1,
        price: product.price,
        discountPrice: product.discount_price,
      },
    }));
  };

  const renderFilters = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Фильтры</Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Category Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Категория</InputLabel>
        <Select
          value={categoryId}
          label="Категория"
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <MenuItem value="">Все категории</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Range */}
      <Typography gutterBottom>Цена (сом)</Typography>
      <Slider
        value={priceRange}
        onChange={(_, value) => setPriceRange(value as number[])}
        onChangeCommitted={loadProducts}
        valueLabelDisplay="auto"
        min={0}
        max={100000}
        step={1000}
        sx={{ mb: 3 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {priceRange[0]} сом
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {priceRange[1]} сом
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          setCategoryId('');
          setPriceRange([0, 100000]);
          setPage(1);
          loadProducts();
        }}
      >
        Сбросить фильтры
      </Button>
    </Box>
  );

  const renderProductCard = (product: Product) => {
    const isFavorite = favoriteIds.includes(product.id);

    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-4px)',
              transition: 'all 0.3s',
            },
          }}
        >
          {/* Promoted Badge */}
          {product.is_promoted && (
            <Chip
              label="Продвигается"
              color="warning"
              size="small"
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
            />
          )}

          {/* Discount Badge */}
          {product.discount_percent && (
            <Chip
              label={`-${product.discount_percent}%`}
              color="error"
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            />
          )}

          {/* Favorite Button */}
          <IconButton
            sx={{ position: 'absolute', top: 8, right: product.discount_percent ? 56 : 8, zIndex: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(product.id);
            }}
          >
            {isFavorite ? (
              <FavoriteFilledIcon color="error" />
            ) : (
              <FavoriteIcon />
            )}
          </IconButton>

          {/* Product Image */}
          <CardMedia
            component="img"
            height="200"
            image={product.images?.[0] || '/placeholder.png'}
            alt={product.title}
            sx={{ objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => navigate(`/products/${product.id}`)}
          />

          <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(`/products/${product.id}`)}>
            <Typography gutterBottom variant="h6" component="div" noWrap>
              {product.title}
            </Typography>

            {/* Price */}
            <Box sx={{ mb: 1 }}>
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
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  {product.price} сом
                </Typography>
              )}
            </Box>

            {/* Seller */}
            <Typography variant="body2" color="text.secondary" noWrap>
              🏪 {product.seller.shop_name}
            </Typography>
          </CardContent>

          <CardActions>
            <Button
              fullWidth
              variant="contained"
              startIcon={<CartIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              В корзину
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Товары</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Каталог товаров
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Найдите всё необходимое на рынках Кыргызстана
        </Typography>
      </Box>

      {/* Search and Filters Bar */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Поиск товаров..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />

          {/* Sort */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={sortBy}
              label="Сортировка"
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <MenuItem value="created_at">Новые</MenuItem>
              <MenuItem value="price_asc">Цена: по возрастанию</MenuItem>
              <MenuItem value="price_desc">Цена: по убыванию</MenuItem>
              <MenuItem value="popular">Популярные</MenuItem>
            </Select>
          </FormControl>

          {/* Filter Button (Mobile) */}
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setDrawerOpen(true)}
            sx={{ minWidth: 120 }}
          >
            Фильтры
          </Button>
        </Stack>

        {/* Active Filters */}
        {(categoryId || priceRange[0] > 0 || priceRange[1] < 100000) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categoryId && (
              <Chip
                label={`Категория: ${categories.find((c) => c.id === Number(categoryId))?.name}`}
                onDelete={() => handleFilterChange('category', '')}
              />
            )}
            {(priceRange[0] > 0 || priceRange[1] < 100000) && (
              <Chip
                label={`${priceRange[0]} - ${priceRange[1]} сом`}
                onDelete={() => setPriceRange([0, 100000])}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Filters Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 320 }}>{renderFilters()}</Box>
      </Drawer>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Товары не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Попробуйте изменить параметры поиска
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Найдено товаров: {products.length}
              </Typography>

              <Grid container spacing={3}>
                {products.map(renderProductCard)}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => {
                      setPage(value);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductsPage;
