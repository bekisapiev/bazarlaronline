import React, { useState, useCallback, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../services/api';
import debounce from 'lodash/debounce';

interface Suggestion {
  id: string;
  title: string;
  type: 'product' | 'category' | 'seller';
  subtitle?: string;
}

const SearchBar: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchAPI.getSuggestions(query, 10);
      const suggestions: Suggestion[] = [
        ...response.data.products.map((p: any) => ({
          id: p.id,
          title: p.title,
          type: 'product' as const,
          subtitle: `${p.price} сом`,
        })),
        ...response.data.categories.map((c: any) => ({
          id: c.id,
          title: c.name,
          type: 'category' as const,
          subtitle: 'Категория',
        })),
        ...response.data.sellers.map((s: any) => ({
          id: s.id,
          title: s.store_name || s.full_name,
          type: 'seller' as const,
          subtitle: 'Продавец',
        })),
      ];
      setOptions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the API call
  const debouncedFetch = useCallback(
    debounce((query: string) => fetchSuggestions(query), 300),
    []
  );

  useEffect(() => {
    debouncedFetch(inputValue);
  }, [inputValue, debouncedFetch]);

  const handleSelect = (event: any, value: string | Suggestion | null) => {
    if (!value || typeof value === 'string') return;

    if (value.type === 'product') {
      navigate(`/products/${value.id}`);
    } else if (value.type === 'category') {
      navigate(`/products?category=${value.id}`);
    } else if (value.type === 'seller') {
      navigate(`/sellers/${value.id}`);
    }
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !loading) {
      navigate(`/products?search=${encodeURIComponent(inputValue)}`);
      setInputValue('');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'primary';
      case 'category':
        return 'secondary';
      case 'seller':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Товар';
      case 'category':
        return 'Категория';
      case 'seller':
        return 'Продавец';
      default:
        return '';
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={(event, newValue) => setInputValue(newValue)}
      onChange={handleSelect}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.title
      }
      filterOptions={(x) => x} // Disable built-in filtering as we're using API
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Поиск товаров, категорий, продавцов..."
          onKeyPress={handleKeyPress}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">{option.title}</Typography>
              {option.subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {option.subtitle}
                </Typography>
              )}
            </Box>
            <Chip
              label={getTypeLabel(option.type)}
              size="small"
              color={getTypeColor(option.type) as any}
            />
          </Box>
        </Box>
      )}
      noOptionsText={
        inputValue.length < 2
          ? 'Введите минимум 2 символа'
          : 'Ничего не найдено'
      }
    />
  );
};

export default SearchBar;
