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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  WhatsApp,
  Telegram,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { productsAPI, categoriesAPI } from '../services/api';

interface PartnerProduct {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  partner_percent: number;
  images?: string[];
  seller: {
    id: string;
    shop_name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

const PartnerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPercentFilter, setMinPercentFilter] = useState('');
  const [sortBy, setSortBy] = useState('partner_percent');

  // Share Dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PartnerProduct | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCategories();
    loadPartnerProducts();
  }, [isAuthenticated, navigate, page, categoryFilter, minPercentFilter, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories({ parent_id: null });
      // Handle different response formats
      const categoriesData = Array.isArray(response.data) ? response.data : response.data?.categories || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    }
  };

  const loadPartnerProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        page,
        page_size: 24,
        partner_products: true, // только товары с партнерским процентом ≥ 2%
        sort_by: sortBy,
      };

      if (categoryFilter) params.category_id = categoryFilter;
      if (minPercentFilter) params.min_partner_percent = minPercentFilter;

      const response = await productsAPI.getProducts(params);

      // Handle different response formats
      let productsData: PartnerProduct[] = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        productsData = response.data.items;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      }

      setProducts(productsData);
      setTotalPages(response.data?.total_pages || 1);
    } catch (err: any) {
      console.error('Error loading partner products:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки партнерских товаров');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = (productId: string) => {
    const baseUrl = window.location.origin;
    const referralId = user?.referral_id || 'your-id';
    return `${baseUrl}/products/${productId}?ref=${referralId}`;
  };

  const handleOpenShare = (product: PartnerProduct) => {
    setSelectedProduct(product);
    const link = generateReferralLink(product.id);
    setReferralLink(link);
    setShareDialogOpen(true);
    setCopySuccess(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      setError('Ошибка копирования ссылки');
    }
  };

  const handleShareWhatsApp = () => {
    if (!selectedProduct) return;
    const text = `Посмотрите ${selectedProduct.title} - получите скидку!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    if (!selectedProduct) return;
    const text = `Посмотрите ${selectedProduct.title} - получите скидку!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    if (!selectedProduct) return;
    const subject = `Интересное предложение: ${selectedProduct.title}`;
    const body = `Здравствуйте!\n\nПосмотрите это предложение:\n${selectedProduct.title}\n\n${referralLink}\n\nС уважением`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  const calculateEarnings = (price: number, partnerPercent: number) => {
    const commission = (price * partnerPercent) / 100;
    const partnerEarnings = commission * 0.4; // 40% партнеру
    return partnerEarnings.toFixed(2);
  };

  const renderProductCard = (product: PartnerProduct) => {
    const finalPrice = product.discount_price || product.price;
    const earnings = calculateEarnings(finalPrice, product.partner_percent);

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
          {/* Partner Badge */}
          <Chip
            label={`${product.partner_percent}% партнерских`}
            color="primary"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, fontWeight: 600 }}
          />

          {/* Discount Badge */}
          {product.discount_percent && (
            <Chip
              label={`-${product.discount_percent}%`}
              color="error"
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            />
          )}

          {/* Product Image */}
          <CardMedia
            component="img"
            height="200"
            image={product.images && Array.isArray(product.images) && product.images[0] ? product.images[0] : '/placeholder.png'}
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

            {/* Earnings */}
            <Box
              sx={{
                bgcolor: 'success.light',
                p: 1,
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600} color="success.dark">
                💰 Ваш доход: {earnings} сом
              </Typography>
            </Box>

            {/* Seller */}
            <Typography variant="body2" color="text.secondary" noWrap>
              🏪 {product.seller.shop_name}
            </Typography>

            {/* Category */}
            {product.category && (
              <Chip
                label={product.category.name}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </CardContent>

          <CardActions>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenShare(product);
              }}
            >
              Поделиться
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Партнерские товары
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Зарабатывайте до 40% от партнерского процента, делясь ссылками на товары
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Info Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Как это работает:</strong> Поделитесь ссылкой на товар. Когда кто-то совершит покупку по вашей
          ссылке, вы получите 40% от партнерского процента на свой реферальный баланс.
        </Typography>
      </Alert>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Категория</InputLabel>
            <Select
              value={categoryFilter}
              label="Категория"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">Все категории</MenuItem>
              {Array.isArray(categories) && categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Минимальный %</InputLabel>
            <Select
              value={minPercentFilter}
              label="Минимальный %"
              onChange={(e) => {
                setMinPercentFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">Любой</MenuItem>
              <MenuItem value="5">От 5%</MenuItem>
              <MenuItem value="10">От 10%</MenuItem>
              <MenuItem value="15">От 15%</MenuItem>
              <MenuItem value="20">От 20%</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={sortBy}
              label="Сортировка"
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="partner_percent">По проценту</MenuItem>
              <MenuItem value="price_desc">По цене (убыв.)</MenuItem>
              <MenuItem value="price_asc">По цене (возр.)</MenuItem>
              <MenuItem value="created_at">По новизне</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !Array.isArray(products) || products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Партнерские товары не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Попробуйте изменить фильтры
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Найдено товаров: {products.length}
          </Typography>

          <Grid container spacing={3}>
            {Array.isArray(products) && products.map(renderProductCard)}
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Поделиться товаром</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedProduct.title}
              </Typography>

              <TextField
                fullWidth
                value={referralLink}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Tooltip title={copySuccess ? 'Скопировано!' : 'Копировать'}>
                      <IconButton onClick={handleCopyLink} edge="end">
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                Поделиться через:
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<WhatsApp />}
                  onClick={handleShareWhatsApp}
                  sx={{ color: '#25D366', borderColor: '#25D366' }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Telegram />}
                  onClick={handleShareTelegram}
                  sx={{ color: '#0088cc', borderColor: '#0088cc' }}
                >
                  Telegram
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={handleShareEmail}
                >
                  Email
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PartnerProductsPage;
