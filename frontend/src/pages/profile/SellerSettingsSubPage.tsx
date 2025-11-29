import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { Storefront as StorefrontIcon } from '@mui/icons-material';
import BackButton from '../../components/profile/BackButton';
import { usersAPI } from '../../services/api';

interface SellerProfile {
  id?: string;
  shop_name: string;
  description?: string;
}

const SellerSettingsSubPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await usersAPI.getCurrentUser();
      setSellerProfile(response.data.seller_profile);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <BackButton title="Настройки продавца" />

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Настройки продавца
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sellerProfile
                ? 'Управляйте информацией о вашем магазине'
                : 'Создайте профиль продавца, чтобы начать продавать товары и услуги'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<StorefrontIcon />}
            onClick={() => navigate('/seller-settings')}
            size="large"
          >
            {sellerProfile ? 'Перейти к настройкам' : 'Создать профиль'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SellerSettingsSubPage;
