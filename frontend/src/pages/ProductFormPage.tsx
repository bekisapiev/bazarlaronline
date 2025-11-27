import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
  IconButton,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  InputAdornment,
  Stack,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  ShoppingBag as ProductIcon,
  MiscellaneousServices as ServiceIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/api';
import { formatErrorMessage } from '../utils/errorHandler';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  level: number;
  children?: Category[];
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category_id: number | null;
  images: string[];
  is_service: boolean;
  discount_price?: number;
  discount_percent?: number;
  stock_quantity?: number;
  delivery_available: boolean;
  characteristics: Record<string, string>;
  is_referral_enabled?: boolean;
  referral_commission_percent?: number;
}

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { user } = useSelector((state: RootState) => state.auth);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    category_id: null,
    images: [],
    is_service: false,
    delivery_available: false,
    characteristics: {},
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Categories - теперь поддерживаем 4 уровня
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<number | null>(null); // Товары/Услуги
  const [selectedLevel2, setSelectedLevel2] = useState<number | null>(null); // Электроника, Одежда и т.д.
  const [selectedLevel3, setSelectedLevel3] = useState<number | null>(null); // Телефоны, Ноутбуки и т.д.
  const [selectedLevel4, setSelectedLevel4] = useState<number | null>(null); // Смартфоны, Чехлы и т.д.

  // Image upload
  const [uploadingImages, setUploadingImages] = useState(false);

  // Characteristics
  const [newCharKey, setNewCharKey] = useState('');
  const [newCharValue, setNewCharValue] = useState('');

  // Promotion
  const [promotionPackages, setPromotionPackages] = useState<any[]>([]);
  const [selectedPromotionViews, setSelectedPromotionViews] = useState<number>(0);
  const [promoting, setPromoting] = useState(false);
  const [promotionStats, setPromotionStats] = useState<{
    views_remaining: number;
    views_total: number;
    is_promoted: boolean;
  }>({ views_remaining: 0, views_total: 0, is_promoted: false });

  // Helper functions - must be defined before they are used
  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const flatten = (categories: Category[]) => {
      for (const cat of categories) {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      }
    };
    flatten(cats);
    return result;
  };

  // Найти путь от категории до корня
  const findCategoryPath = useCallback((categoryId: number, availableCategories: Category[]): number[] => {
    const category = availableCategories.find(c => c.id === categoryId);
    if (!category) return [];

    const path: number[] = [categoryId];
    let current = category;

    // Идем вверх по иерархии
    while (current.parent_id) {
      path.unshift(current.parent_id);
      const parent = availableCategories.find(c => c.id === current.parent_id);
      if (!parent) break;
      current = parent;
    }

    return path;
  }, []);

  // Helper function to set category selection based on category_id
  const setCategorySelection = useCallback((categoryId: number, availableCategories: Category[]) => {
    console.log('setCategorySelection called with:', categoryId, 'categories count:', availableCategories.length);

    const path = findCategoryPath(categoryId, availableCategories);
    console.log('Category path:', path);

    // Сбрасываем все уровни
    setSelectedLevel1(null);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
    setSelectedLevel4(null);

    // Устанавливаем уровни в зависимости от длины пути
    if (path.length >= 1) setSelectedLevel1(path[0]);
    if (path.length >= 2) setSelectedLevel2(path[1]);
    if (path.length >= 3) setSelectedLevel3(path[2]);
    if (path.length >= 4) setSelectedLevel4(path[3]);

    console.log('Set levels:', { level1: path[0], level2: path[1], level3: path[2], level4: path[3] });
  }, [findCategoryPath]);

  // Load categories
  useEffect(() => {
    loadCategories();
    loadPromotionPackages(); // Load for both create and edit modes
  }, []);

  const loadProduct = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const response = await productsAPI.getProductById(productId);
      const product = response.data;

      console.log('Loading product:', product);
      console.log('Product category_id:', product.category_id, 'type:', typeof product.category_id);

      // Convert characteristics array to object format for form
      const characteristicsObject: Record<string, string> = {};
      if (Array.isArray(product.characteristics)) {
        product.characteristics.forEach((char: any) => {
          // Backend uses 'name' field, not 'key'
          const key = char.name || char.key;
          const value = char.value;
          if (key && value) {
            characteristicsObject[key] = value;
          }
        });
      } else if (typeof product.characteristics === 'object' && product.characteristics !== null) {
        // Handle if backend returns object format
        Object.assign(characteristicsObject, product.characteristics);
      }

      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        images: product.images || [],
        is_service: product.product_type === 'service',
        discount_price: product.discount_price,
        discount_percent: product.discount_percent,
        stock_quantity: product.stock_quantity,
        delivery_available: product.delivery_type === 'paid',
        characteristics: characteristicsObject,
        is_referral_enabled: product.is_referral_enabled || false,
        referral_commission_percent: product.referral_commission_percent,
      });

      // Set promotion stats
      setPromotionStats({
        views_remaining: product.promotion_views_remaining || 0,
        views_total: product.promotion_views_total || 0,
        is_promoted: product.is_promoted || false,
      });
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Ошибка загрузки товара'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load product if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadProduct(id);
      loadPromotionPackages();
    }
  }, [isEditMode, id, loadProduct]);

  // Set category hierarchy when categories and product are loaded
  useEffect(() => {
    console.log('Category selection effect triggered');
    console.log('formData.category_id:', formData.category_id, 'type:', typeof formData.category_id);
    console.log('flatCategories.length:', flatCategories.length);

    if (formData.category_id && flatCategories.length > 0) {
      console.log('Both values present, calling setCategorySelection');
      setCategorySelection(formData.category_id, flatCategories);
    }
  }, [formData.category_id, flatCategories, setCategorySelection]);

  const loadPromotionPackages = async () => {
    try {
      const response = await productsAPI.getPromotionPackages();
      setPromotionPackages(response.data.packages || []);
    } catch (err) {
      console.error('Failed to load promotion packages:', err);
    }
  };

  const handlePromote = async () => {
    if (!id || selectedPromotionViews === 0) return;

    setPromoting(true);
    try {
      await productsAPI.promoteProduct(id, selectedPromotionViews);
      setSuccess(`Товар продвигается! Добавлено ${selectedPromotionViews} просмотров.`);
      setSelectedPromotionViews(0);
      // Reload product to get updated promotion stats
      await loadProduct(id);
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Ошибка при продвижении'));
    } finally {
      setPromoting(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategoryTree();
      console.log('Categories response:', response.data);

      // Handle different response formats
      let categoriesData: Category[] = [];

      if (response.data && Array.isArray(response.data.tree)) {
        // Backend returns {tree: [...]} for hierarchical category tree
        categoriesData = response.data.tree;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        categoriesData = response.data.items;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else {
        console.warn('Unexpected categories data format:', response.data);
      }

      console.log('Loaded categories:', categoriesData);
      setCategories(categoriesData);

      // Create flat list for easier lookup
      const flat = flattenCategories(categoriesData);
      console.log('Flattened categories:', flat);
      setFlatCategories(flat);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
      setFlatCategories([]);
    }
  };

  const findCategoryById = (cats: Category[], id: number): Category | null => {
    // First, try to find in the current level
    for (const cat of cats) {
      if (cat.id === id) return cat;
    }

    // Then search in children recursively
    for (const cat of cats) {
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }

    return null;
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      setError('Максимум 10 изображений');
      return;
    }

    setUploadingImages(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const response = await uploadAPI.uploadImage(file);
        uploadedUrls.push(response.data.url);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err: any) {
      setError(formatErrorMessage(err, 'Ошибка загрузки изображений'));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddCharacteristic = () => {
    if (!newCharKey.trim() || !newCharValue.trim()) return;

    setFormData((prev) => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [newCharKey]: newCharValue,
      },
    }));

    setNewCharKey('');
    setNewCharValue('');
  };

  const handleRemoveCharacteristic = (key: string) => {
    setFormData((prev) => {
      const newChars = { ...prev.characteristics };
      delete newChars[key];
      return { ...prev, characteristics: newChars };
    });
  };

  // Обработчики для всех 4 уровней категорий
  const handleLevel1Change = (categoryId: number) => {
    setSelectedLevel1(categoryId);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
    setSelectedLevel4(null);
    setFormData((prev) => ({ ...prev, category_id: categoryId }));
  };

  const handleLevel2Change = (categoryId: number) => {
    setSelectedLevel2(categoryId);
    setSelectedLevel3(null);
    setSelectedLevel4(null);
    setFormData((prev) => ({ ...prev, category_id: categoryId }));
  };

  const handleLevel3Change = (categoryId: number) => {
    setSelectedLevel3(categoryId);
    setSelectedLevel4(null);
    setFormData((prev) => ({ ...prev, category_id: categoryId }));
  };

  const handleLevel4Change = (categoryId: number) => {
    setSelectedLevel4(categoryId);
    setFormData((prev) => ({ ...prev, category_id: categoryId }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Укажите название';
    }

    if (!formData.description.trim()) {
      errors.description = 'Укажите описание';
    }

    if (formData.price <= 0) {
      errors.price = 'Цена должна быть больше 0';
    }

    if (!formData.category_id) {
      errors.category_id = 'Выберите категорию';
    }

    if (formData.images.length === 0) {
      errors.images = 'Загрузите хотя бы одно изображение';
    }

    if (!formData.is_service && formData.stock_quantity !== undefined && formData.stock_quantity < 0) {
      errors.stock_quantity = 'Количество не может быть отрицательным';
    }

    if (formData.discount_price && formData.discount_price >= formData.price) {
      errors.discount_price = 'Цена со скидкой должна быть меньше обычной цены';
    }

    if (formData.is_referral_enabled) {
      if (!formData.referral_commission_percent) {
        errors.referral_commission_percent = 'Укажите процент комиссии';
      } else if (formData.referral_commission_percent < 1 || formData.referral_commission_percent > 50) {
        errors.referral_commission_percent = 'Процент комиссии должен быть от 1% до 50%';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Исправьте ошибки в форме');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Convert characteristics object to array format expected by backend
      const characteristicsArray = Object.entries(formData.characteristics).map(([name, value]) => ({
        name,
        value,
      }));

      // Map frontend data to backend schema
      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category_id: formData.category_id!,
        images: formData.images,
        product_type: formData.is_service ? 'service' : 'product',
        characteristics: characteristicsArray.length > 0 ? characteristicsArray : undefined,
        discount_price: formData.discount_price || undefined,
        delivery_type: formData.delivery_available ? 'paid' : 'pickup',
        is_referral_enabled: formData.is_referral_enabled || false,
        referral_commission_percent: formData.is_referral_enabled ? formData.referral_commission_percent : undefined,
      };

      if (isEditMode && id) {
        await productsAPI.updateProduct(id, productData);
        setSuccess(
          `${formData.is_service ? 'Услуга' : 'Товар'} успешно ${formData.is_service ? 'обновлена' : 'обновлен'}`
        );
      } else {
        const response = await productsAPI.createProduct(productData);
        setSuccess(
          `${formData.is_service ? 'Услуга' : 'Товар'} успешно ${formData.is_service ? 'добавлена' : 'добавлен'}! Теперь вы можете продвинуть его.`
        );

        // Redirect to edit page after 1.5 seconds so user can promote
        setTimeout(() => {
          navigate(`/products/${response.data.id}/edit`);
        }, 1500);
      }
    } catch (err: any) {
      setError(
        formatErrorMessage(err, `Ошибка при сохранении ${formData.is_service ? 'услуги' : 'товара'}`)
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Получаем категории для каждого уровня
  const level1Categories = categories.filter((c) => c.level === 1);
  const level2Categories = selectedLevel1
    ? categories.find((c) => c.id === selectedLevel1)?.children || []
    : [];
  const level3Categories = selectedLevel2
    ? flatCategories.find((c) => c.id === selectedLevel2)?.children || []
    : [];
  const level4Categories = selectedLevel3
    ? flatCategories.find((c) => c.id === selectedLevel3)?.children || []
    : [];

  // Построение хлебных крошек для категорий
  const buildCategoryBreadcrumb = () => {
    const parts: string[] = [];
    if (selectedLevel1) {
      const cat = flatCategories.find(c => c.id === selectedLevel1);
      if (cat) parts.push(cat.name);
    }
    if (selectedLevel2) {
      const cat = flatCategories.find(c => c.id === selectedLevel2);
      if (cat) parts.push(cat.name);
    }
    if (selectedLevel3) {
      const cat = flatCategories.find(c => c.id === selectedLevel3);
      if (cat) parts.push(cat.name);
    }
    if (selectedLevel4) {
      const cat = flatCategories.find(c => c.id === selectedLevel4);
      if (cat) parts.push(cat.name);
    }
    return parts.join(' → ');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <MuiLink component={Link} to="/profile" underline="hover" color="inherit">
          Профиль
        </MuiLink>
        <Typography color="text.primary">
          {isEditMode ? 'Редактировать товар' : 'Добавить товар'}
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Typography variant="h4" gutterBottom fontWeight={600}>
        {isEditMode
          ? `Редактировать ${formData.is_service ? 'услугу' : 'товар'}`
          : `Добавить ${formData.is_service ? 'услугу' : 'товар'}`}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {isEditMode
          ? 'Обновите информацию о вашем объявлении'
          : 'Заполните форму для размещения объявления на площадке'}
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Product/Service Toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <ToggleButtonGroup
                  value={formData.is_service ? 'service' : 'product'}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      handleInputChange('is_service', newValue === 'service');
                    }
                  }}
                  aria-label="product type"
                  size="large"
                >
                  <ToggleButton value="product" aria-label="product">
                    <ProductIcon sx={{ mr: 1 }} />
                    Товар
                  </ToggleButton>
                  <ToggleButton value="service" aria-label="service">
                    <ServiceIcon sx={{ mr: 1 }} />
                    Услуга
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField
                fullWidth
                label="Название"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Описание"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
                multiline
                rows={6}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Цена"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    error={!!formErrors.price}
                    helperText={formErrors.price}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">сом</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Цена со скидкой (необязательно)"
                    type="number"
                    value={formData.discount_price || ''}
                    onChange={(e) =>
                      handleInputChange('discount_price', e.target.value ? Number(e.target.value) : undefined)
                    }
                    error={!!formErrors.discount_price}
                    helperText={formErrors.discount_price}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">сом</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              {!formData.is_service && (
                <TextField
                  fullWidth
                  label="Количество на складе"
                  type="number"
                  value={formData.stock_quantity || ''}
                  onChange={(e) =>
                    handleInputChange('stock_quantity', e.target.value ? Number(e.target.value) : undefined)
                  }
                  error={!!formErrors.stock_quantity}
                  helperText={formErrors.stock_quantity}
                  sx={{ mt: 2 }}
                />
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.delivery_available}
                    onChange={(e) => handleInputChange('delivery_available', e.target.checked)}
                  />
                }
                label="Доставка доступна"
                sx={{ mt: 2 }}
              />
            </Paper>

            {/* Referral Program (Business tariff only) */}
            {user?.tariff === 'business' && (
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.50' }}>
                <Typography variant="h6" gutterBottom>
                  Реферальная программа
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_referral_enabled || false}
                      onChange={(e) => handleInputChange('is_referral_enabled', e.target.checked)}
                    />
                  }
                  label="Включить реферальную программу для этого товара"
                  sx={{ mb: 2 }}
                />

                {formData.is_referral_enabled && (
                  <>
                    <TextField
                      fullWidth
                      label="Процент комиссии"
                      type="number"
                      value={formData.referral_commission_percent || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        handleInputChange('referral_commission_percent', value);
                      }}
                      error={!!formErrors.referral_commission_percent}
                      helperText={formErrors.referral_commission_percent || 'От 1% до 50%'}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{
                        min: 1,
                        max: 50,
                        step: 1,
                      }}
                      sx={{ mb: 2 }}
                    />

                    {formData.referral_commission_percent && formData.price && (
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Комиссия для рефералов:</strong>
                          {' '}
                          {((formData.discount_price || formData.price) * formData.referral_commission_percent / 100).toFixed(2)} сом
                          {' '}
                          ({formData.referral_commission_percent}% от{' '}
                          {formData.discount_price ? 'цены со скидкой' : 'обычной цены'})
                        </Typography>
                      </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Любой пользователь сможет делиться ссылкой на этот товар и получать комиссию с каждой покупки.
                    </Typography>
                  </>
                )}
              </Paper>
            )}

            {/* Images */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Изображения
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {formErrors.images && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.images}
                </Alert>
              )}

              <Button
                variant="outlined"
                component="label"
                startIcon={uploadingImages ? <CircularProgress size={20} /> : <UploadIcon />}
                disabled={uploadingImages || formData.images.length >= 10}
                sx={{ mb: 2 }}
              >
                {uploadingImages ? 'Загрузка...' : 'Загрузить изображения'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Максимум 10 изображений. Рекомендуемый размер: 350x350px
              </Typography>

              {formData.images.length > 0 && (
                <ImageList cols={4} gap={8}>
                  {formData.images.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        loading="lazy"
                        style={{ height: 120, objectFit: 'cover' }}
                      />
                      <ImageListItemBar
                        actionIcon={
                          <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Paper>

            {/* Characteristics */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Характеристики
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Название"
                    value={newCharKey}
                    onChange={(e) => setNewCharKey(e.target.value)}
                    placeholder="Например: Цвет"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Значение"
                    value={newCharValue}
                    onChange={(e) => setNewCharValue(e.target.value)}
                    placeholder="Например: Красный"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleAddCharacteristic}
                    disabled={!newCharKey.trim() || !newCharValue.trim()}
                    sx={{ height: '40px' }}
                  >
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>

              {Object.entries(formData.characteristics).length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(formData.characteristics).map(([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      onDelete={() => handleRemoveCharacteristic(key)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Categories - 4 УРОВНЯ */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Категория
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {categories.length === 0 ? (
                <Alert severity="info">
                  Загрузка категорий...
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Выберите категорию для вашего {formData.is_service ? 'услуги' : 'товара'}
                  </Typography>

                  {/* Level 1: Товары/Услуги */}
                  <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.category_id}>
                    <InputLabel>Тип *</InputLabel>
                    <Select
                      value={selectedLevel1 || ''}
                      label="Тип *"
                      onChange={(e) => handleLevel1Change(Number(e.target.value))}
                    >
                      <MenuItem value="" disabled>
                        <em>Выберите тип</em>
                      </MenuItem>
                      {level1Categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Level 2: Электроника, Одежда и т.д. */}
                  {level2Categories.length > 0 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Категория *</InputLabel>
                      <Select
                        value={selectedLevel2 || ''}
                        label="Категория *"
                        onChange={(e) => handleLevel2Change(Number(e.target.value))}
                      >
                        <MenuItem value="" disabled>
                          <em>Выберите категорию</em>
                        </MenuItem>
                        {level2Categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Level 3: Телефоны, Ноутбуки и т.д. */}
                  {level3Categories.length > 0 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Подкатегория</InputLabel>
                      <Select
                        value={selectedLevel3 || ''}
                        label="Подкатегория"
                        onChange={(e) => handleLevel3Change(Number(e.target.value))}
                      >
                        <MenuItem value="">
                          <em>Не выбрано</em>
                        </MenuItem>
                        {level3Categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Level 4: Смартфоны, Чехлы и т.д. */}
                  {level4Categories.length > 0 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Детальная категория</InputLabel>
                      <Select
                        value={selectedLevel4 || ''}
                        label="Детальная категория"
                        onChange={(e) => handleLevel4Change(Number(e.target.value))}
                      >
                        <MenuItem value="">
                          <em>Не выбрано</em>
                        </MenuItem>
                        {level4Categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Показываем выбранный путь категории */}
                  {buildCategoryBreadcrumb() && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Выбрано:</strong><br />
                        {buildCategoryBreadcrumb()}
                      </Typography>
                    </Alert>
                  )}

                  {formErrors.category_id && (
                    <FormHelperText error>{formErrors.category_id}</FormHelperText>
                  )}
                </>
              )}
            </Paper>

            {/* Promotion (Edit mode only) */}
            {isEditMode && (
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Typography variant="h6" gutterBottom>
                  Продвижение товара
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Alert
                  severity={promotionStats.is_promoted ? 'success' : 'info'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2">
                    {promotionStats.is_promoted ? (
                      <>
                        <strong>Товар продвигается!</strong><br />
                        Осталось просмотров: {promotionStats.views_remaining} из {promotionStats.views_total}
                      </>
                    ) : (
                      <>
                        <strong>Товар не продвигается.</strong><br />
                        Купите пакет просмотров для продвижения
                      </>
                    )}
                  </Typography>
                </Alert>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Выберите пакет просмотров</InputLabel>
                  <Select
                    value={selectedPromotionViews}
                    label="Выберите пакет просмотров"
                    onChange={(e) => setSelectedPromotionViews(Number(e.target.value))}
                  >
                    <MenuItem value={0}>
                      <em>Не выбрано</em>
                    </MenuItem>
                    {promotionPackages.map((pkg) => (
                      <MenuItem key={pkg.views} value={pkg.views}>
                        {pkg.views} просмотров — {pkg.price.toFixed(2)} сом
                        {pkg.price_per_view > 0 && ` (${pkg.price_per_view.toFixed(2)} сом/просмотр)`}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {user?.tariff === 'pro' && 'Скидка 33% для PRO тарифа'}
                    {user?.tariff === 'business' && 'Скидка 50% для BUSINESS тарифа'}
                  </FormHelperText>
                </FormControl>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handlePromote}
                  disabled={promoting || selectedPromotionViews === 0}
                  startIcon={promoting ? <CircularProgress size={20} /> : undefined}
                >
                  {promoting ? 'Продвижение...' : 'Продвинуть товар'}
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Продвинутые товары показываются выше в списке и получают больше просмотров
                </Typography>
              </Paper>
            )}

            {/* Actions */}
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                >
                  {saving
                    ? 'Сохранение...'
                    : isEditMode
                    ? 'Сохранить изменения'
                    : `Добавить ${formData.is_service ? 'услугу' : 'товар'}`}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/profile"
                >
                  Отмена
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default ProductFormPage;
