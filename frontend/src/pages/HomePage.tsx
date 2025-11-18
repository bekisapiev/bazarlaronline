import React, { useEffect, useState, useRef } from 'react';
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
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Skeleton,
  Drawer,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  ShoppingBag as ProductIcon,
  MiscellaneousServices as ServiceIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Store as MarketIcon,
  Storefront as BoutiqueIcon,
  Home as HomeIcon,
  Business as OfficeIcon,
  LocalShipping as MobileIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  images: string[];
  is_promoted: boolean;
  is_service: boolean;
}

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Category[];
}

interface City {
  id: number;
  name: string;
}

interface Market {
  id: number;
  name: string;
  city_id: number;
}

const SELLER_TYPES = [
  { value: 'market', label: 'Рынок', icon: <MarketIcon /> },
  { value: 'boutique', label: 'Бутик', icon: <BoutiqueIcon /> },
  { value: 'shop', label: 'Магазин', icon: <MarketIcon /> },
  { value: 'office', label: 'Офис', icon: <OfficeIcon /> },
  { value: 'home', label: 'Дом', icon: <HomeIcon /> },
  { value: 'mobile', label: 'Мобильный', icon: <MobileIcon /> },
  { value: 'warehouse', label: 'Склад', icon: <WarehouseIcon /> },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Filters
  const [contentType, setContentType] = useState<'product' | 'service'>('product');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory1, setSelectedCategory1] = useState<number | null>(null);
  const [selectedCategory2, setSelectedCategory2] = useState<number | null>(null);
  const [selectedCategory3, setSelectedCategory3] = useState<number | null>(null);
  const [sellerType, setSellerType] = useState<string | null>(null);

  // Products and loading
  const [products, setProductsState] = useState<Product[]>([]);
  const [loading, setLoadingState] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Load initial data
  useEffect(() => {
    loadCities();
    loadCategories();
  }, []);

  // Reset and reload when filters change
  useEffect(() => {
    setProductsState([]);
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, selectedCity, selectedMarket, selectedCategory1, selectedCategory2, selectedCategory3, sellerType]);

  // Infinite scroll setup
  useEffect(() => {
    if (!loadingRef.current || !hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading]);

  // Load more products when page changes
  useEffect(() => {
    if (page > 1) {
      loadProducts(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Load markets when city changes
  useEffect(() => {
    if (selectedCity) {
      loadMarkets(selectedCity);
    } else {
      setMarkets([]);
      setSelectedMarket(null);
    }
  }, [selectedCity]);

  const loadCities = async () => {
    try {
      const response = await productsAPI.getCities();
      setCities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    }
  };

  const loadMarkets = async (cityId: number) => {
    try {
      const response = await productsAPI.getMarkets({ city_id: cityId });
      setMarkets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading markets:', error);
      setMarkets([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadProducts = async (pageNum: number, reset: boolean) => {
    if (loading) return;

    setLoadingState(true);
    setError(null);

    try {
      const params: any = {
        page: pageNum,
        page_size: 30,
        is_service: contentType === 'service',
      };

      if (selectedCity) params.city_id = selectedCity;
      if (selectedMarket) params.market_id = selectedMarket;
      if (selectedCategory3) params.category_id = selectedCategory3;
      else if (selectedCategory2) params.category_id = selectedCategory2;
      else if (selectedCategory1) params.category_id = selectedCategory1;
      if (sellerType) params.seller_type = sellerType;

      const response = await productsAPI.getProducts(params);
      const newProducts = response.data.items || [];

      if (reset) {
        setProductsState(newProducts);
      } else {
        setProductsState((prev) => [...prev, ...newProducts]);
      }

      setHasMore(newProducts.length === 30);
    } catch (error: any) {
      console.error('Error loading products:', error);
      setError('Ошибка загрузки товаров');
    } finally {
      setLoadingState(false);
    }
  };

  const handleContentTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'product' | 'service' | null
  ) => {
    if (newType !== null) {
      setContentType(newType);
    }
  };

  const category1Options = Array.isArray(categories) ? categories : [];
  const category2Options = selectedCategory1
    ? category1Options.find((c) => c.id === selectedCategory1)?.children || []
    : [];
  const category3Options = selectedCategory2
    ? category2Options.find((c) => c.id === selectedCategory2)?.children || []
    : [];

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" height={20} width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderProductCard = (product: Product) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': { boxShadow: 6, transform: 'translateY(-4px)', transition: 'all 0.3s' },
      }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {product.is_promoted && (
        <Chip
          label="Продвигается"
          color="warning"
          size="small"
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
        />
      )}
      {product.discount_percent && (
        <Chip
          label={`-${product.discount_percent}%`}
          color="error"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        />
      )}

      <CardMedia
        component="img"
        height="200"
        image={product.images[0] || '/placeholder.png'}
        alt={product.title}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {product.discount_price ? (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {product.price} сом
              </Typography>
              <Typography variant="h6" color="error" fontWeight={600}>
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
        <Button size="small" color="primary" fullWidth variant="outlined">
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );

  const renderFilters = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Фильтры
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        {/* City Filter */}
        <FormControl fullWidth size="small">
          <InputLabel>Город</InputLabel>
          <Select
            value={selectedCity || ''}
            label="Город"
            onChange={(e) => setSelectedCity(e.target.value ? Number(e.target.value) : null)}
          >
            <MenuItem value="">Все города</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Market Filter (shown when city is selected and seller type is market) */}
        {selectedCity && (sellerType === 'market' || !sellerType) && markets.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel>Рынок</InputLabel>
            <Select
              value={selectedMarket || ''}
              label="Рынок"
              onChange={(e) => setSelectedMarket(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">Все рынки</MenuItem>
              {markets.map((market) => (
                <MenuItem key={market.id} value={market.id}>
                  {market.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Seller Type */}
        <FormControl fullWidth size="small">
          <InputLabel>Тип продавца</InputLabel>
          <Select
            value={sellerType || ''}
            label="Тип продавца"
            onChange={(e) => setSellerType(e.target.value || null)}
          >
            <MenuItem value="">Все типы</MenuItem>
            {SELLER_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {type.icon}
                  {type.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category Level 1 */}
        <FormControl fullWidth size="small">
          <InputLabel>Категория</InputLabel>
          <Select
            value={selectedCategory1 || ''}
            label="Категория"
            onChange={(e) => {
              setSelectedCategory1(e.target.value ? Number(e.target.value) : null);
              setSelectedCategory2(null);
              setSelectedCategory3(null);
            }}
          >
            <MenuItem value="">Все категории</MenuItem>
            {category1Options.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category Level 2 */}
        {selectedCategory1 && category2Options.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel>Подкатегория</InputLabel>
            <Select
              value={selectedCategory2 || ''}
              label="Подкатегория"
              onChange={(e) => {
                setSelectedCategory2(e.target.value ? Number(e.target.value) : null);
                setSelectedCategory3(null);
              }}
            >
              <MenuItem value="">Все подкатегории</MenuItem>
              {category2Options.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Category Level 3 */}
        {selectedCategory2 && category3Options.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel>Раздел</InputLabel>
            <Select
              value={selectedCategory3 || ''}
              label="Раздел"
              onChange={(e) => setSelectedCategory3(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">Все разделы</MenuItem>
              {category3Options.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button
          variant="outlined"
          onClick={() => {
            setSelectedCity(null);
            setSelectedMarket(null);
            setSelectedCategory1(null);
            setSelectedCategory2(null);
            setSelectedCategory3(null);
            setSellerType(null);
          }}
        >
          Сбросить фильтры
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          borderRadius: 2,
          color: 'white',
          mb: 4,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Bazarlar Online
        </Typography>
        <Typography variant="h6" gutterBottom>
          Торговая площадка Кыргызстана
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          Покупайте и продавайте товары и услуги. Зарабатывайте с партнерской программой.
        </Typography>
      </Box>

      {/* Content Type Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={contentType}
          exclusive
          onChange={handleContentTypeChange}
          aria-label="content type"
          size="large"
        >
          <ToggleButton value="product" aria-label="products">
            <ProductIcon sx={{ mr: 1 }} />
            Товары
          </ToggleButton>
          <ToggleButton value="service" aria-label="services">
            <ServiceIcon sx={{ mr: 1 }} />
            Услуги
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters and Products */}
      <Grid container spacing={3}>
        {/* Desktop Filters */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{ p: 2, position: 'sticky', top: 80 }}>{renderFilters()}</Paper>
        </Grid>

        {/* Mobile Filter Button */}
        <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' } }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            fullWidth
            onClick={() => setDrawerOpen(true)}
          >
            Фильтры
          </Button>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {products.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                {contentType === 'product' ? 'Товары не найдены' : 'Услуги не найдены'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Попробуйте изменить параметры фильтров
              </Typography>
            </Box>
          )}

          {page === 1 && loading ? (
            renderSkeleton()
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    {renderProductCard(product)}
                  </Grid>
                ))}
              </Grid>

              {/* Loading More Indicator */}
              {loading && page > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && !loading && (
                <div ref={loadingRef} style={{ height: 20, margin: '20px 0' }} />
              )}

              {!hasMore && products.length > 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  Вы просмотрели все {contentType === 'product' ? 'товары' : 'услуги'}
                </Typography>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Фильтры</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {renderFilters()}
        </Box>
      </Drawer>
    </Container>
  );
};

export default HomePage;
