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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Drawer,
  IconButton,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Avatar,
  Rating,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';

interface Seller {
  id: string;
  shop_name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  city?: {
    id: number;
    name: string;
  };
  market?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
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

interface Category {
  id: number;
  name: string;
  slug: string;
  level: number;
  parent_id?: number | null;
  children?: Category[];
}

const SellersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cityId, setCityId] = useState(searchParams.get('city') || '');
  const [marketId, setMarketId] = useState(searchParams.get('market') || '');
  const [selectedCategory1, setSelectedCategory1] = useState<number | null>(null);
  const [selectedCategory2, setSelectedCategory2] = useState<number | null>(null);
  const [selectedCategory3, setSelectedCategory3] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const loadMarkets = useCallback(async () => {
    try {
      const response = await productsAPI.getMarkets(cityId ? { city_id: cityId } : {});
      // API returns {items: [...], total: ...}
      if (response.data && Array.isArray(response.data.items)) {
        setMarkets(response.data.items);
      } else {
        setMarkets([]);
      }
    } catch (err) {
      setMarkets([]);
    }
  }, [cityId]);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const limit = 24;
      const offset = (page - 1) * limit;

      const params: any = {
        limit,
        offset,
      };

      if (search) params.search = search;
      if (cityId) params.city_id = cityId;
      if (marketId) params.market_id = marketId;
      // Use most specific category selected
      if (selectedCategory3) params.category_id = selectedCategory3;
      else if (selectedCategory2) params.category_id = selectedCategory2;
      else if (selectedCategory1) params.category_id = selectedCategory1;

      const response = await productsAPI.getSellers(params);
      setSellers(response.data.items || []);
      // Calculate total pages from total count
      const totalCount = response.data.total || 0;
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки продавцов');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, cityId, marketId, selectedCategory1, selectedCategory2, selectedCategory3, minRating, verifiedOnly]);

  // Load initial data
  useEffect(() => {
    loadCities();
    loadMarkets();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load sellers when filters change
  useEffect(() => {
    loadSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, search, cityId, marketId, selectedCategory1, selectedCategory2, selectedCategory3, minRating, verifiedOnly]);

  const loadCities = async () => {
    try {
      const response = await productsAPI.getCities();
      // API returns {items: [...], total: ...}
      if (response.data && Array.isArray(response.data.items)) {
        setCities(response.data.items);
      } else {
        setCities([]);
      }
    } catch (err) {
      setCities([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategoryTree();
      // Backend returns {tree: [...]} for hierarchical category tree
      if (response.data && Array.isArray(response.data.tree)) {
        setCategories(response.data.tree);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]); // Set to empty array on error
    }
  };

  // Helper functions to get categories by level
  const getCategory1 = () => categories.find((c) => c.id === selectedCategory1);
  const getCategory2 = () => getCategory1()?.children?.find((c) => c.id === selectedCategory2);
  const getCategory3 = () => getCategory2()?.children?.find((c) => c.id === selectedCategory3);

  const category1Options = categories;
  const category2Options = getCategory1()?.children || [];
  const category3Options = getCategory2()?.children || [];

  const handleSearch = () => {
    setPage(1);
    loadSellers();
    updateURL();
  };

  const handleFilterChange = (filter: string, value: any) => {
    setPage(1);
    if (filter === 'city') {
      setCityId(value);
      setMarketId(''); // Reset market when city changes
      if (value) loadMarkets();
    }
    if (filter === 'market') setMarketId(value);
    if (filter === 'rating') setMinRating(value);
    if (filter === 'verified') setVerifiedOnly(value);
    if (filter === 'sort') setSortBy(value);
    updateURL();
  };

  const updateURL = () => {
    const params: any = {};
    if (search) params.search = search;
    if (cityId) params.city = cityId;
    if (marketId) params.market = marketId;
    if (selectedCategory3) params.category = selectedCategory3;
    else if (selectedCategory2) params.category = selectedCategory2;
    else if (selectedCategory1) params.category = selectedCategory1;
    if (minRating > 0) params.rating = minRating.toString();
    if (verifiedOnly) params.verified = 'true';
    if (sortBy !== 'rating') params.sort = sortBy;
    if (page > 1) params.page = page.toString();
    setSearchParams(params);
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

      {/* City Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Город</InputLabel>
        <Select
          value={cityId}
          label="Город"
          onChange={(e) => handleFilterChange('city', e.target.value)}
        >
          <MenuItem value="">Все города</MenuItem>
          {cities.map((city) => (
            <MenuItem key={city.id} value={city.id}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Market Filter */}
      <FormControl fullWidth sx={{ mb: 3 }} disabled={!cityId}>
        <InputLabel>Рынок</InputLabel>
        <Select
          value={marketId}
          label="Рынок"
          onChange={(e) => handleFilterChange('market', e.target.value)}
        >
          <MenuItem value="">Все рынки</MenuItem>
          {markets.map((market) => (
            <MenuItem key={market.id} value={market.id}>
              {market.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Category Level 1 Filter */}
      <FormControl fullWidth sx={{ mb: 2 }}>
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

      {/* Category Level 2 Filter */}
      {selectedCategory1 && category2Options.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
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

      {/* Category Level 3 Filter */}
      {selectedCategory2 && category3Options.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
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

      {/* Min Rating */}
      <Typography gutterBottom>Минимальный рейтинг</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Rating
          value={minRating}
          onChange={(_, value) => handleFilterChange('rating', value || 0)}
          size="large"
        />
        {minRating > 0 && (
          <Typography sx={{ ml: 1 }}>от {minRating}</Typography>
        )}
      </Box>

      {/* Verified Only */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <Button
          variant={verifiedOnly ? 'contained' : 'outlined'}
          startIcon={<VerifiedIcon />}
          onClick={() => handleFilterChange('verified', !verifiedOnly)}
        >
          {verifiedOnly ? 'Только проверенные' : 'Все продавцы'}
        </Button>
      </FormControl>

      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          setCityId('');
          setMarketId('');
          setSelectedCategory1(null);
          setSelectedCategory2(null);
          setSelectedCategory3(null);
          setMinRating(0);
          setVerifiedOnly(false);
          setPage(1);
          loadSellers();
        }}
      >
        Сбросить фильтры
      </Button>
    </Box>
  );

  const renderSellerCard = (seller: Seller) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={seller.id}>
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
        onClick={() => navigate(`/sellers/${seller.id}`)}
      >
        {/* Banner or Logo */}
        {seller.banner_url || seller.logo_url ? (
          <CardMedia
            component="img"
            height="140"
            image={seller.banner_url || seller.logo_url}
            alt={seller.shop_name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 140,
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StoreIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          {/* Logo Avatar */}
          {seller.logo_url && seller.banner_url && (
            <Avatar
              src={seller.logo_url}
              alt={seller.shop_name}
              sx={{
                width: 60,
                height: 60,
                mt: -5,
                mb: 2,
                border: '3px solid white',
                boxShadow: 2,
              }}
            />
          )}

          {/* Shop Name with Verified Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1 }}>
              {seller.shop_name}
            </Typography>
            {seller.is_verified && (
              <VerifiedIcon color="primary" sx={{ ml: 1 }} />
            )}
          </Box>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={seller.rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {seller.rating.toFixed(1)} ({seller.reviews_count})
            </Typography>
          </Box>

          {/* Description */}
          {seller.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {seller.description}
            </Typography>
          )}

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap>
              {seller.city?.name}
              {seller.market && `, ${seller.market.name}`}
            </Typography>
          </Box>

          {/* Category */}
          {seller.category && (
            <Chip
              label={seller.category.name}
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sellers/${seller.id}`);
            }}
          >
            Посмотреть товары
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Продавцы</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Каталог продавцов
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Найдите надежных продавцов на рынках Кыргызстана
        </Typography>
      </Box>

      {/* Search and Filters Bar */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Поиск продавцов..."
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
              <MenuItem value="rating">По рейтингу</MenuItem>
              <MenuItem value="reviews">По отзывам</MenuItem>
              <MenuItem value="created_at">Новые</MenuItem>
            </Select>
          </FormControl>

          {/* Filter Button */}
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
        {(cityId || marketId || selectedCategory1 || minRating > 0 || verifiedOnly) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {cityId && (
              <Chip
                label={`Город: ${cities.find((c) => c.id === Number(cityId))?.name}`}
                onDelete={() => handleFilterChange('city', '')}
              />
            )}
            {marketId && (
              <Chip
                label={`Рынок: ${markets.find((m) => m.id === Number(marketId))?.name}`}
                onDelete={() => handleFilterChange('market', '')}
              />
            )}
            {selectedCategory1 && (
              <Chip
                label={`Категория: ${getCategory1()?.name || ''}`}
                onDelete={() => {
                  setSelectedCategory1(null);
                  setSelectedCategory2(null);
                  setSelectedCategory3(null);
                }}
              />
            )}
            {selectedCategory2 && (
              <Chip
                label={`Подкатегория: ${getCategory2()?.name || ''}`}
                onDelete={() => {
                  setSelectedCategory2(null);
                  setSelectedCategory3(null);
                }}
              />
            )}
            {selectedCategory3 && (
              <Chip
                label={`Раздел: ${getCategory3()?.name || ''}`}
                onDelete={() => setSelectedCategory3(null)}
              />
            )}
            {minRating > 0 && (
              <Chip
                icon={<StarIcon />}
                label={`от ${minRating}`}
                onDelete={() => handleFilterChange('rating', 0)}
              />
            )}
            {verifiedOnly && (
              <Chip
                icon={<VerifiedIcon />}
                label="Проверенные"
                onDelete={() => handleFilterChange('verified', false)}
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

      {/* Sellers Grid */}
      {!loading && !error && (
        <>
          {sellers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Продавцы не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Попробуйте изменить параметры поиска
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Найдено продавцов: {sellers.length}
              </Typography>

              <Grid container spacing={3}>
                {sellers.map(renderSellerCard)}
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

export default SellersPage;
