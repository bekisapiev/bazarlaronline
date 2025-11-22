import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { ShoppingCart, Phone, LocationOn } from '@mui/icons-material';
import { ordersAPI } from '../../services/api';

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    discount_price?: number;
    image?: string;
    seller?: {
      id: string;
    };
  };
  onOrderSuccess?: (orderId: string) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, product, onOrderSuccess }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalPrice = product.discount_price || product.price;
  const totalAmount = finalPrice * quantity;

  const handleSubmit = async () => {
    // Validation
    if (!deliveryAddress.trim()) {
      setError('Укажите адрес доставки');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Укажите номер телефона');
      return;
    }

    // Phone validation (Kyrgyzstan format)
    const phoneRegex = /^\+?996\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''))) {
      setError('Неверный формат номера. Используйте формат: +996XXXXXXXXX');
      return;
    }

    if (quantity < 1) {
      setError('Количество должно быть не менее 1');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!product.seller?.id) {
        setError('Информация о продавце недоступна');
        setLoading(false);
        return;
      }

      const response = await ordersAPI.createOrder({
        seller_id: product.seller.id,
        items: [
          {
            product_id: product.id,
            quantity: quantity,
            price: product.price,
            discount_price: product.discount_price || null,
          },
        ],
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        payment_method: 'wallet',
        is_service: false,
      });

      // Success
      if (onOrderSuccess) {
        onOrderSuccess(response.data.id);
      }

      // Reset form
      setQuantity(1);
      setDeliveryAddress('');
      setPhoneNumber('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCart color="primary" />
          <Typography variant="h6">Оформление заказа</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Product Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
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
        </Box>

        {/* Quantity */}
        <TextField
          fullWidth
          label="Количество"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          InputProps={{
            inputProps: { min: 1 },
          }}
          sx={{ mb: 2 }}
        />

        {/* Delivery Address */}
        <TextField
          fullWidth
          label="Адрес доставки"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Укажите улицу, дом, квартиру"
          multiline
          rows={2}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Phone Number */}
        <TextField
          fullWidth
          label="Номер телефона"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+996XXXXXXXXX"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone color="action" />
              </InputAdornment>
            ),
          }}
          helperText="Формат: +996555123456"
          sx={{ mb: 2 }}
        />

        {/* Total Amount */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'primary.light',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Итого:
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.dark">
            {totalAmount.toLocaleString()} сом
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCart />}
        >
          {loading ? 'Оформление...' : 'Оформить заказ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderModal;
