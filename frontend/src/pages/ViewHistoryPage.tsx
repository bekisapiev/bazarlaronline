import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Button,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  History,
  NavigateNext,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { favoritesAPI } from '../services/api';

interface ViewHistoryItem {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  images: string[];
  viewed_at: string;
}

const ViewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadViewHistory();
  }, []);

  const loadViewHistory = async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getViewHistory({ limit: 100, offset: 0 });
      const historyData = Array.isArray(response.data)
        ? response.data
        : (response.data.items || []);
      setViewHistory(historyData);
    } catch (err: any) {
      console.error('Error loading view history:', err);
      setError(err.response?.data?.detail || 'Не удалось загрузить историю просмотров');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Главная
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/my-profile"
          onClick={(e) => {
            e.preventDefault();
            navigate('/my-profile');
          }}
        >
          Профиль
        </Link>
        <Typography color="text.primary">История просмотров</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          История просмотров
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Товары и услуги, которые вы недавно просматривали
        </Typography>
      </Box>

      {/* Content */}
      {viewHistory.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <History sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            История просмотров пуста
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Просматривайте товары, и они будут отображаться здесь
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Смотреть товары
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {viewHistory.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                }}
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    item.images && item.images.length > 0
                      ? item.images[0]
                      : 'https://via.placeholder.com/200'
                  }
                  alt={item.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 1,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                    {item.discount_price || item.price} сом
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Просмотрено: {formatDate(item.viewed_at)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ViewHistoryPage;
