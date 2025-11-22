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
import { EventAvailable, Phone, CalendarMonth, AccessTime } from '@mui/icons-material';

interface ServiceBookingModalProps {
  open: boolean;
  onClose: () => void;
  service: {
    id: string;
    title: string;
    price: number;
    discount_price?: number;
    image?: string;
  };
  onBookingSuccess?: (bookingId: string) => void;
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  open,
  onClose,
  service,
  onBookingSuccess,
}) => {
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finalPrice = service.discount_price || service.price;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    // Validation
    if (!bookingDate) {
      setError('Укажите дату записи');
      return;
    }

    if (!bookingTime) {
      setError('Укажите время записи');
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

    // Check if date is not in the past
    const selectedDate = new Date(bookingDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (selectedDate < currentDate) {
      setError('Нельзя записаться на прошедшую дату');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // const response = await ordersAPI.createServiceBooking({
      //   service_id: service.id,
      //   booking_date: bookingDate,
      //   booking_time: bookingTime,
      //   phone_number: phoneNumber,
      //   comment: comment,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success
      if (onBookingSuccess) {
        onBookingSuccess('mock-booking-id');
      }

      // Reset form
      setBookingDate('');
      setBookingTime('');
      setPhoneNumber('');
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при записи на услугу');
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
          <EventAvailable color="primary" />
          <Typography variant="h6">Запись на услугу</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Service Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {service.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {service.discount_price ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'line-through' }}
                >
                  {service.price} сом
                </Typography>
                <Typography variant="h6" color="error" fontWeight={600}>
                  {service.discount_price} сом
                </Typography>
              </>
            ) : (
              <Typography variant="h6" color="primary" fontWeight={600}>
                {service.price} сом
              </Typography>
            )}
          </Box>
        </Box>

        {/* Booking Date */}
        <TextField
          fullWidth
          label="Дата записи"
          type="date"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: today,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonth color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Booking Time */}
        <TextField
          fullWidth
          label="Время записи"
          type="time"
          value={bookingTime}
          onChange={(e) => setBookingTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTime color="action" />
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

        {/* Comment (Optional) */}
        <TextField
          fullWidth
          label="Комментарий (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Укажите дополнительные пожелания"
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {/* Price Display */}
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
            Стоимость услуги:
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.dark">
            {finalPrice.toLocaleString()} сом
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
          startIcon={loading ? <CircularProgress size={20} /> : <EventAvailable />}
        >
          {loading ? 'Запись...' : 'Записаться'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceBookingModal;
