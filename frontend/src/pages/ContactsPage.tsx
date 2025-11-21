import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Telegram as TelegramIcon,
  WhatsApp as WhatsAppIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
} from '@mui/icons-material';

const contacts = [
  {
    icon: <EmailIcon sx={{ fontSize: 30 }} />,
    title: 'Email',
    value: 'support@bazarlar.online',
    link: 'mailto:support@bazarlar.online',
  },
  {
    icon: <PhoneIcon sx={{ fontSize: 30 }} />,
    title: 'Телефон',
    value: '+996 555 123 456',
    link: 'tel:+996555123456',
  },
  {
    icon: <TelegramIcon sx={{ fontSize: 30 }} />,
    title: 'Telegram',
    value: '@bazarlar_support',
    link: 'https://t.me/bazarlar_support',
  },
  {
    icon: <WhatsAppIcon sx={{ fontSize: 30 }} />,
    title: 'WhatsApp',
    value: '+996 555 123 456',
    link: 'https://wa.me/996555123456',
  },
];

const ContactsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email');
      return;
    }

    // TODO: Send form data to backend
    console.log('Contact form submitted:', formData);

    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });

    // Reset submitted message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Свяжитесь с нами
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Мы всегда рады помочь вам
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Напишите нам
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Заполните форму ниже, и мы свяжемся с вами в ближайшее время
            </Typography>

            {submitted && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Спасибо за ваше сообщение! Мы ответим вам в ближайшее время.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Имя"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Тема"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Сообщение"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<SendIcon />}
                    sx={{
                      backgroundColor: '#FF6B35',
                      '&:hover': {
                        backgroundColor: '#ff5722',
                      },
                    }}
                  >
                    Отправить сообщение
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={5}>
          {/* Contact Methods */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Контактная информация
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {contacts.map((contact, index) => (
                <Grid item xs={12} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => window.open(contact.link, '_blank')}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: '#FF6B35' }}>{contact.icon}</Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {contact.title}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {contact.value}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Additional Info */}
          <Card sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Адрес"
                  secondary="г. Бишкек, Кыргызстан"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Часы работы"
                  secondary="Пн-Пт: 9:00 - 18:00, Сб: 10:00 - 16:00"
                />
              </ListItem>
            </List>
          </Card>

          {/* FAQ Link */}
          <Card sx={{ p: 3, mt: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Часто задаваемые вопросы
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Возможно, ваш вопрос уже есть в нашем FAQ
            </Typography>
            <Button
              variant="outlined"
              href="/tutorials"
              sx={{
                borderColor: '#FF6B35',
                color: '#FF6B35',
                '&:hover': {
                  borderColor: '#ff5722',
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                },
              }}
            >
              Перейти к FAQ
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactsPage;
