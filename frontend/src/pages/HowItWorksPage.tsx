import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  CalendarMonth,
  Share,
  AttachMoney,
  TrendingUp,
  Handshake,
  Rocket,
  Stars,
} from '@mui/icons-material';

const HowItWorksPage: React.FC = () => {
  const sections = [
    {
      icon: <ShoppingCart sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Как заказать товар',
      content: [
        'Выберите понравившийся товар из каталога',
        'Укажите адрес доставки и контактный телефон',
        'Подтвердите заказ - оплата наличными при получении',
        'Продавец получит уведомление и свяжется с вами',
        'Отслеживайте статус заказа в личном кабинете',
      ],
    },
    {
      icon: <CalendarMonth sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Как записаться на услугу',
      content: [
        'Найдите нужную услугу в каталоге',
        'Выберите удобное время и специалиста',
        'Укажите ваши контактные данные',
        'Подтвердите запись - оплата при посещении',
        'Получите напоминание перед визитом',
      ],
    },
    {
      icon: <Share sx={{ fontSize: 48, color: 'success.main' }} />,
      title: 'Реферальная программа для пользователей',
      content: [
        'Пригласите друзей по своей реферальной ссылке',
        'Получайте 5% кэшбек с каждого пополнения баланса вашими рефералами',
        'Кэшбек начисляется пожизненно на ваш реферальный счет',
        'Переводите средства на основной счет и используйте для покупок',
        'Чем больше активных рефералов - тем больше пассивный доход!',
      ],
    },
    {
      icon: <AttachMoney sx={{ fontSize: 48, color: 'warning.main' }} />,
      title: 'Реферальная программа для продавцов',
      content: [
        'Активируйте реферальную программу для своих товаров (тариф Business)',
        'Установите процент комиссии от 1% до 50%',
        'Пользователи делятся ссылкой и привлекают покупателей',
        'Партнер получает 45% от вашей комиссии при завершении заказа',
        'Платформа получает 55% - это выгодно всем!',
      ],
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: 'info.main' }} />,
      title: 'Продвижение товаров',
      content: [
        'Покупайте просмотры для продвижения товаров (от 500 до 5000)',
        'Продвигаемые товары показываются несколько раз на главной',
        'Чем больше просмотров осталось - тем чаще показ',
        'Цены: 10 сом - 500 просмотров, 100 сом - 5000 просмотров',
        'Для тарифов PRO и BUSINESS действуют скидки до 50%',
      ],
    },
    {
      icon: <Handshake sx={{ fontSize: 48, color: 'error.main' }} />,
      title: 'Партнерская программа',
      content: [
        'Становитесь партнером платформы Bazarlar Online',
        'Получайте 45% комиссии с каждого заказа по вашей ссылке',
        'Делитесь реферальными ссылками на товары',
        'Зарабатывайте на реферальном балансе без вложений',
        'Выводите средства или используйте для покупок',
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Rocket sx={{ fontSize: 64, color: 'primary.main' }} />
        </Box>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Как это работает?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
          Bazarlar Online - это современная торговая площадка Кыргызстана,
          где каждый может зарабатывать, покупать и развивать свой бизнес
        </Typography>
      </Box>

      {/* Platform Overview */}
      <Paper sx={{ p: 4, mb: 6, bgcolor: 'primary.50', border: 2, borderColor: 'primary.main' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Stars sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={600}>
            О платформе
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          <strong>Bazarlar Online</strong> - это инновационная платформа, которая объединяет покупателей,
          продавцов и партнеров в единую экосистему. Мы создали место, где:
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'white' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  Покупателям
                </Typography>
                <Typography variant="body2">
                  Удобные покупки товаров и запись на услуги с кэшбеком за приглашение друзей
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'white' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom color="secondary">
                  Продавцам
                </Typography>
                <Typography variant="body2">
                  Мощные инструменты для продвижения товаров и привлечения партнеров
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'white' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom color="success.main">
                  Партнерам
                </Typography>
                <Typography variant="body2">
                  Возможность зарабатывать комиссию, делясь ссылками на товары
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Sections */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Основные возможности
        </Typography>
        <Grid container spacing={4}>
          {sections.map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {section.icon}
                  <Typography variant="h5" fontWeight={600}>
                    {section.title}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                  {section.content.map((item, idx) => (
                    <Typography
                      component="li"
                      key={idx}
                      variant="body1"
                      sx={{ mb: 1, lineHeight: 1.8 }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Готовы начать?
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.95 }}>
          Присоединяйтесь к Bazarlar Online уже сегодня и откройте новые возможности!
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body1" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1.5, borderRadius: 2 }}>
            ✓ Бесплатная регистрация
          </Typography>
          <Typography variant="body1" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1.5, borderRadius: 2 }}>
            ✓ Быстрый старт продаж
          </Typography>
          <Typography variant="body1" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1.5, borderRadius: 2 }}>
            ✓ Пассивный доход
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default HowItWorksPage;
