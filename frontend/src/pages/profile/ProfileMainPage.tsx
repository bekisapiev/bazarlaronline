import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Storefront as StorefrontIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  Inventory as InventoryIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { usersAPI, walletAPI } from '../../services/api';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  tariff?: string;
}

const ProfileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainBalance, setMainBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [referralLink, setReferralLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadProfile();
    loadWallet();
    loadReferralData();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await usersAPI.getCurrentUser();
      setProfile(response.data);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      const response = await walletAPI.getBalance();
      const balanceData = response.data;
      setMainBalance(balanceData.main_balance ?? balanceData.balance ?? 0);
      setReferralBalance(balanceData.referral_balance ?? 0);
    } catch (err) {
      console.error('Error loading wallet:', err);
    }
  };

  const loadReferralData = async () => {
    try {
      const [linkRes, statsRes] = await Promise.all([
        usersAPI.getReferralLink(),
        usersAPI.getReferralStats(),
      ]);
      setReferralLink(linkRes.data.referral_link);
      setReferralCode(linkRes.data.referral_code);
      setReferralStats(statsRes.data);
    } catch (err) {
      console.error('Error loading referral data:', err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const menuItems = [
    {
      title: 'Настройки продавца',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      path: '/profile/seller-settings',
    },
    {
      title: 'Мои товары и услуги',
      icon: <StorefrontIcon sx={{ fontSize: 40 }} />,
      path: '/profile/my-products',
    },
    {
      title: 'Мои заказы',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      path: '/profile/my-orders',
    },
    {
      title: 'Мне заказали',
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      path: '/profile/ordered-from-me',
    },
    {
      title: `Кошелек`,
      subtitle: `${Number(mainBalance ?? 0).toFixed(2)} сом`,
      icon: <WalletIcon sx={{ fontSize: 40 }} />,
      path: '/profile/wallet',
      showBalance: true,
    },
    {
      title: 'Реферальные товары',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      path: '/profile/reserved-products',
    },
  ];

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
    <Container maxWidth="md" sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      {/* Profile Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          borderRadius: 2,
          p: 3,
          mb: 2,
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Edit Button */}
        <IconButton
          onClick={() => navigate('/settings')}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
          size="small"
        >
          <EditIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={profile?.avatar}
            sx={{
              width: 60,
              height: 60,
              mr: 2,
              border: '3px solid white',
            }}
          >
            {profile?.full_name?.[0]?.toUpperCase() || profile?.email[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {profile?.full_name || 'Не указано'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {profile?.email}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {profile?.phone || '0700000000'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tariff Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Текущий тариф:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={profile?.tariff?.toUpperCase() || 'BUSINESS'}
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#45a049' },
              textTransform: 'none',
            }}
            onClick={() => navigate('/tariffs')}
          >
            Сменить тариф
          </Button>
        </Box>
      </Box>

      {/* Menu Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {menuItems.map((item, index) => (
          <Grid item xs={6} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 3,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>{item.icon}</Box>
                <Typography variant="body1" fontWeight={500}>
                  {item.title}
                </Typography>
                {item.showBalance && (
                  <Typography variant="h6" fontWeight={600} color="primary" sx={{ mt: 1 }}>
                    {item.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Referral Program */}
      <Card sx={{ mb: 8 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Партнерская программа
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Всего рефералов:
                </Typography>
                <Typography variant="h4" fontWeight={600} color="primary">
                  {referralStats?.total_referrals || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Активных:
                </Typography>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {referralStats?.active_referrals || 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Всего заработано:
            </Typography>
            <Typography variant="h5" fontWeight={600} color="primary">
              {Number(referralStats?.total_earned || 0).toFixed(2)} сом
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              Ваша партнерская ссылка
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={referralLink}
                InputProps={{
                  readOnly: true,
                  sx: { fontSize: '0.875rem' },
                }}
              />
              <IconButton
                onClick={() => handleCopy(referralLink)}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <CopyIcon />
              </IconButton>
            </Box>
            {copySuccess && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                Скопировано!
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              Ваш реферальный код
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {referralCode}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfileMainPage;
