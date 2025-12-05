import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  LocalAtm as CashIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';

interface WarehouseStats {
  total_stock_quantity: number;
  total_purchase_cost: number;
  total_revenue: number;
  projected_revenue: number;
  total_items_sold: number;
  total_partner_commission: number;
  paid_partner_commission: number;
  profit: number;
  projected_profit: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${color}.lighter 0%, ${color}.light 100%)`,
        border: `2px solid`,
        borderColor: `${color}.main`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
          {title}
        </Typography>
        <Box sx={{ color: `${color}.main`, opacity: 0.7 }}>{icon}</Box>
      </Box>
      <Typography variant="h4" fontWeight={700} color={`${color}.dark`} gutterBottom>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

const WarehouseStatistics: React.FC = () => {
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getWarehouseStatistics();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading warehouse statistics:', err);
      // If user doesn't have access, don't show error
      if (err.response?.status !== 403) {
        setError('Ошибка загрузки статистики');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const formatNumber = (num: number | string) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    return (value || 0).toLocaleString('ru-RU');
  };

  const formatCurrency = (num: number | string) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    return `${(value || 0).toFixed(2)} сом`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        📊 Статистика склада
      </Typography>

      <Grid container spacing={2}>
        {/* Row 1: Склад */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Товаров на складе"
            value={formatNumber(stats.total_stock_quantity)}
            subtitle="Общее количество"
            icon={<InventoryIcon sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Сумма закупа"
            value={formatCurrency(stats.total_purchase_cost)}
            subtitle="Вложено в товары"
            icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>

        {/* Row 2: Выручка */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Общая выручка"
            value={formatCurrency(stats.total_revenue)}
            subtitle={`Продано: ${formatNumber(stats.total_items_sold)} шт`}
            icon={<MoneyIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Предварительная выручка"
            value={formatCurrency(stats.projected_revenue)}
            subtitle="Если продать весь склад"
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>

        {/* Row 3: Комиссии */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Комиссия партнеров"
            value={formatCurrency(stats.total_partner_commission)}
            subtitle="Потенциальная (на весь склад)"
            icon={<AccountBalanceIcon sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Выплачено партнерам"
            value={formatCurrency(stats.paid_partner_commission)}
            subtitle="Реальная выплата"
            icon={<CashIcon sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>

        {/* Row 4: Прибыль */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Прибыль"
            value={formatCurrency(stats.profit)}
            subtitle="Выручка - Закуп - Комиссии"
            icon={<ChartIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Проектируемая прибыль"
            value={formatCurrency(stats.projected_profit)}
            subtitle="При продаже всего склада"
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default WarehouseStatistics;
