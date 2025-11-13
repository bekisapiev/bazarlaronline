import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  PlayCircleOutline as VideoIcon,
  Article as ArticleIcon,
  Help as HelpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article';
  duration?: string;
  thumbnail?: string;
  category: string;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const TutorialsPage: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Как зарегистрироваться и создать профиль продавца',
      description: 'Пошаговая инструкция по регистрации и настройке профиля продавца на платформе',
      type: 'video',
      duration: '5 мин',
      category: 'Начало работы',
    },
    {
      id: '2',
      title: 'Как добавить товар: полное руководство',
      description: 'Узнайте, как правильно добавить товар с фотографиями, описанием и характеристиками',
      type: 'video',
      duration: '8 мин',
      category: 'Управление товарами',
    },
    {
      id: '3',
      title: 'Продвижение товаров: что нужно знать',
      description: 'Как использовать платное продвижение для увеличения продаж',
      type: 'video',
      duration: '6 мин',
      category: 'Продвижение',
    },
    {
      id: '4',
      title: 'Партнерская программа: заработок на рефералах',
      description: 'Подробное руководство по партнерской программе и способам заработка',
      type: 'article',
      category: 'Партнерская программа',
    },
    {
      id: '5',
      title: 'Работа с заказами и доставкой',
      description: 'Как обрабатывать заказы, общаться с покупателями и организовать доставку',
      type: 'video',
      duration: '10 мин',
      category: 'Заказы',
    },
    {
      id: '6',
      title: 'Статистика и аналитика продаж',
      description: 'Как использовать статистику для увеличения продаж',
      type: 'article',
      category: 'Аналитика',
    },
  ];

  const faqs: FAQ[] = [
    {
      question: 'Как зарегистрироваться на платформе?',
      answer:
        'Для регистрации нажмите кнопку "Войти" в правом верхнем углу и выберите "Войти через Google". После авторизации вы сможете создать профиль продавца в разделе "Профиль".',
      category: 'Регистрация',
    },
    {
      question: 'Сколько стоит размещение товаров?',
      answer:
        'Базовый тариф бесплатный и позволяет разместить до 10 товаров. Тариф "Стандарт" (300 сом/мес) - до 100 товаров. Тариф "Бизнес" (500 сом/мес) - неограниченное количество товаров и партнерская программа.',
      category: 'Тарифы',
    },
    {
      question: 'Как добавить товар?',
      answer:
        'Перейдите в "Профиль" → "Мои объявления" → "Добавить товар". Заполните название, описание, цену, загрузите фотографии (до 10 шт) и укажите категорию. Рекомендуемый размер фотографий - 350x350px.',
      category: 'Товары',
    },
    {
      question: 'Что такое продвижение товара?',
      answer:
        'Продвижение - это платная услуга, которая поднимает ваш товар в топ результатов поиска. Стоимость - 50 сом за 7 дней. Продвигаемые товары получают больше просмотров и продаж.',
      category: 'Продвижение',
    },
    {
      question: 'Как работает партнерская программа?',
      answer:
        'Партнерская программа доступна на тарифе "Бизнес". Вы получаете реферальную ссылку, делитесь ей с друзьями. Когда они регистрируются и делают покупки, вы получаете 5% от суммы их покупок. Минимальная сумма вывода - 100 сом.',
      category: 'Партнерская программа',
    },
    {
      question: 'Как вывести деньги?',
      answer:
        'Перейдите в "Профиль" → "Кошелек" → "Вывести средства". Укажите сумму (минимум 100 сом), выберите способ вывода (банковская карта или электронный кошелек) и подтвердите операцию. Деньги поступят в течение 1-3 рабочих дней.',
      category: 'Финансы',
    },
    {
      question: 'Как обрабатывать заказы?',
      answer:
        'Все заказы отображаются в разделе "Заказы" → "Мне заказали". Вы можете изменять статус заказа (Подтвержден, В обработке, Отправлен, Доставлен). Свяжитесь с покупателем через встроенный чат для уточнения деталей доставки.',
      category: 'Заказы',
    },
    {
      question: 'Можно ли редактировать товар после публикации?',
      answer:
        'Да, вы можете редактировать любую информацию о товаре в любое время. Перейдите в "Профиль" → "Мои объявления", найдите нужный товар и нажмите "Редактировать".',
      category: 'Товары',
    },
    {
      question: 'Как связаться с покупателем?',
      answer:
        'Когда покупатель оформляет заказ или пишет вам, в разделе "Сообщения" появляется новый диалог. Вы можете общаться в режиме реального времени, отправлять фото товаров и уточнять детали заказа.',
      category: 'Общение',
    },
    {
      question: 'Что делать, если товар не продается?',
      answer:
        'Проверьте качество фотографий, добавьте подробное описание с характеристиками, установите конкурентную цену. Попробуйте продвижение товара на 7 дней. Также полезно добавить скидку или акцию.',
      category: 'Продажи',
    },
  ];

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const faqCategories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Обучение</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          База знаний
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Всё, что нужно знать для успешной работы на платформе
        </Typography>
      </Box>

      {/* Getting Started */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          С чего начать
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    mb: 2,
                  }}
                >
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    1
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  Зарегистрируйтесь
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Создайте аккаунт через Google и заполните профиль продавца с информацией о вашем магазине
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    mb: 2,
                  }}
                >
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    2
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  Добавьте товары
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Загрузите качественные фото, добавьте описание и характеристики ваших товаров
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'warning.light',
                    mb: 2,
                  }}
                >
                  <Typography variant="h4" color="warning.main" fontWeight={700}>
                    3
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  Начните продавать
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Получайте заказы, общайтесь с покупателями и зарабатывайте
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Video Tutorials */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <VideoIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={600}>
            Видеоуроки
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {tutorials.map((tutorial) => (
            <Grid item xs={12} md={6} key={tutorial.id}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 180,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <VideoIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                  </CardMedia>
                  {tutorial.duration && (
                    <Chip
                      label={tutorial.duration}
                      size="small"
                      sx={{ position: 'absolute', bottom: 8, right: 8 }}
                    />
                  )}
                </Box>
                <CardContent>
                  <Chip label={tutorial.category} size="small" color="primary" sx={{ mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {tutorial.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tutorial.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HelpIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={600}>
            Часто задаваемые вопросы
          </Typography>
        </Box>

        {faqCategories.map((category) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {category}
            </Typography>

            {faqs
              .filter((faq) => faq.category === category)
              .map((faq, index) => (
                <Accordion
                  key={`${category}-${index}`}
                  expanded={expandedFaq === `${category}-${index}`}
                  onChange={handleFaqChange(`${category}-${index}`)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography fontWeight={500}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
          </Box>
        ))}
      </Box>

      {/* Tips for Success */}
      <Paper sx={{ p: 4, bgcolor: 'primary.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <StarIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={600}>
            Советы для успешных продаж
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Качественные фотографии
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Используйте яркие, четкие фотографии на светлом фоне. Покажите товар с разных ракурсов.
                  Рекомендуемый размер: 350x350px.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Подробное описание
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Укажите все важные характеристики: размер, цвет, материал, состояние. Чем подробнее, тем
                  больше доверия у покупателей.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom">
                  Конкурентная цена
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Изучите цены конкурентов на аналогичные товары. Установите справедливую цену или предложите
                  скидку для привлечения покупателей.
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Быстрые ответы
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Отвечайте на вопросы покупателей в течение часа. Быстрая коммуникация увеличивает шанс
                  продажи.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Используйте продвижение
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Продвигайте самые популярные товары на 7 дней за 50 сом. Продвинутые товары получают в 10 раз
                  больше просмотров.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Собирайте отзывы
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Просите довольных покупателей оставлять отзывы. Высокий рейтинг повышает доверие и увеличивает
                  продажи.
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TutorialsPage;
