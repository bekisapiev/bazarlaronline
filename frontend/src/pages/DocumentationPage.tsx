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
  Grid,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingIcon,
  Store as StoreIcon,
  Loyalty as LoyaltyIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const DocumentationPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | false>(false);

  const handleSectionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Документация</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Документация Bazarlar Online
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Полное руководство по использованию платформы
        </Typography>
      </Box>

      {/* О платформе */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} color="primary">
          О платформе
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Bazarlar Online</strong> (bazarlar.online) - это торговая веб-платформа для размещения товаров и
          услуг с системой партнерской программы.
        </Typography>
        <Typography variant="body1" paragraph>
          Платформа предоставляет продавцам возможность:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Создавать лендинги своих магазинов" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Принимать онлайн-платежи через MBank" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Зарабатывать через партнерские программы" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Управлять товарами и заказами в удобном интерфейсе" />
          </ListItem>
        </List>
      </Paper>

      {/* Тарифы */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} color="primary" sx={{ mb: 3 }}>
          Тарифные планы
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Выберите тариф в зависимости от масштаба вашего бизнеса. Вы всегда можете перейти на более продвинутый план.
        </Alert>

        <Grid container spacing={3}>
          {/* FREE */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: 'grey.300',
              }}
            >
              <CardContent>
                <Chip label="БЕСПЛАТНО" color="default" sx={{ mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight={700}>
                  0 сом
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  в месяц
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2">До 10 активных товаров</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2">До 1000 неопубликованных товаров</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CancelIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'error.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      НЕ отображается в каталоге продавцов
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'info.main' }} />
                    <Typography variant="body2">Поднятие товара: 20 сом</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CancelIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'error.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Автоподнятие: НЕТ
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CancelIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'error.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Партнерская программа: НЕТ
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CancelIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'error.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Онлайн-платежи: НЕТ
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* PRO */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative',
              }}
            >
              <Chip
                label="ПОПУЛЯРНЫЙ"
                color="primary"
                sx={{ position: 'absolute', top: -12, right: 16 }}
                size="small"
              />
              <CardContent>
                <Chip label="PRO" color="primary" sx={{ mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight={700}>
                  500 сом
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  в месяц
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2">До 100 активных товаров</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2">До 1000 неопубликованных товаров</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      ОТОБРАЖАЕТСЯ в каталоге продавцов
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'info.main' }} />
                    <Typography variant="body2">Поднятие товара: 15 сом</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Автоподнятие товаров: ДА
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CancelIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'error.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Партнерская программа: НЕТ
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Онлайн-платежи: ДА
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* BUSINESS */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: 'warning.main',
                background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%)',
              }}
            >
              <CardContent>
                <Chip label="BUSINESS" sx={{ mb: 2, bgcolor: 'warning.main', color: 'white' }} />
                <Typography variant="h4" gutterBottom fontWeight={700}>
                  2000 сом
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  в месяц
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      До 1000 активных товаров
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2">До 1000 неопубликованных товаров</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      ОТОБРАЖАЕТСЯ в каталоге продавцов
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InfoIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'info.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Поднятие товара: 10 сом
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Автоподнятие товаров: ДА
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Партнерская программа: ДА
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Онлайн-платежи: ДА
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Реферальная программа для товаров
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CheckIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'success.main' }} />
                    <Typography variant="body2" fontWeight={600}>
                      Расширенная аналитика
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Таблица сравнения */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            Подробное сравнение тарифов
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Функция</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>FREE</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>PRO</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>BUSINESS</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Активные товары</TableCell>
                  <TableCell align="center">10</TableCell>
                  <TableCell align="center">100</TableCell>
                  <TableCell align="center">1000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Отображение в каталоге продавцов</TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Стоимость поднятия товара</TableCell>
                  <TableCell align="center">20 сом</TableCell>
                  <TableCell align="center">15 сом</TableCell>
                  <TableCell align="center">10 сом</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Автоподнятие товаров</TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Онлайн-платежи (MBank)</TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Партнерская программа для товаров</TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Расширенная аналитика</TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Комиссия на товары (1-50%)</TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CancelIcon color="error" />
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="success" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Основные возможности */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600} color="primary" sx={{ mb: 3 }}>
          Основные возможности платформы
        </Typography>

        {/* Для покупателей */}
        <Accordion expanded={expandedSection === 'buyers'} onChange={handleSectionChange('buyers')}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <ShoppingIcon sx={{ mr: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Для покупателей
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Поиск и фильтрация товаров
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Текстовый поиск по названию и описанию товаров
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Фильтрация по категориям (3-уровневая иерархия)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Фильтр по городу, типу продавца и диапазону цен
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Сортировка по релевантности, цене, новизне и популярности
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Автодополнение подсказок при поиске (минимум 2 символа)
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Оформление заказов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Выбор товаров от одного продавца
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Указание адреса доставки и телефона
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Оплата через кошелек платформы или MBank
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Применение промокодов и реферальных кодов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Отслеживание статуса заказа
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Избранное и история
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Добавление товаров в избранное
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Автоматическое сохранение истории просмотров
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Персональные рекомендации на основе просмотров
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Отзывы и рейтинги
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Просмотр отзывов на товары и продавцов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Оставление отзыва после покупки (рейтинг 0-10)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Ответ продавца на отзыв
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Для продавцов */}
        <Accordion expanded={expandedSection === 'sellers'} onChange={handleSectionChange('sellers')}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <StoreIcon sx={{ mr: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Для продавцов
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Создание и управление товарами
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Название до 100 символов, описание до 2000 символов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - До 10 изображений (автоматическая обрезка 350x350px)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Основная цена и цена со скидкой
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - До 10 характеристик (название-значение)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Настройка типа доставки (самовывоз, платная, бесплатная)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Лимиты: Free - 10, Pro - 100, Business - 1000 товаров
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Поднятие объявлений
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Ручное поднятие:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Free: 20 сом | Pro: 15 сом | Business: 10 сом
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Товар перемещается в начало списка результатов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Автоподнятие (Pro и Business):</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Настройка времени начала и окончания
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Частота: минимум каждые 30 минут
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Автоматическая проверка баланса и уведомления
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Управление заказами
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Просмотр всех заказов в разделе "Мне заказали"
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Изменение статуса заказа (обработка → выполнен)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Общение с покупателем через встроенный чат
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Фильтрация заказов по статусу
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Профиль продавца
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Название магазина, описание до 2000 символов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Баннер магазина (1200x300px) и логотип (100x100px)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Категория товаров, город, адрес и координаты
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Тип продавца (рынок, бутик, магазин, офис, дома, на выезд, склад)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Рейтинг и отзывы покупателей
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Аналитика (Business тариф)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Производительность товаров (просмотры, конверсия)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Статистика продаж по периодам
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Средний рейтинг и распределение отзывов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Источники трафика и уникальные посетители
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Партнерская программа */}
        <Accordion expanded={expandedSection === 'partners'} onChange={handleSectionChange('partners')}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <LoyaltyIcon sx={{ mr: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Партнерская программа
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Alert severity="info">
                Партнерская программа - это эффективный способ заработка, приглашая новых пользователей и продвигая
                товары!
              </Alert>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Реферальная система регистрации
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Каждый пользователь получает уникальный реферальный код (12 символов)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Реферальная ссылка: bazarlar.kg/ref/ВАШ_КОД
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Cookie сохраняется на 30 дней после перехода по ссылке
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Бонусы:</strong> Когда реферал пополняет баланс, вы получаете 20% на реферальный баланс
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Бонусы начисляются в течение 1 года с момента регистрации реферала
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Партнерская программа для товаров (только Business)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Включите реферальную программу для товара (1-50% комиссия)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Партнеры получают уникальную ссылку на товар
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - При продаже через реферальную ссылку:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  • Партнер получает 40% от комиссии
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  • Платформа получает 60% от комиссии
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Пример:</strong> Товар 1000 сом с комиссией 10% = 100 сом общей комиссии
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  • Партнер получит: 40 сом
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  • Платформа получит: 60 сом
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Вывод партнерских средств
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Минимальная сумма вывода: 1000 сом
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Только с реферального баланса
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Метод вывода: MBank (номер телефона)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Обработка заявки в течение 1-3 рабочих дней
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Кошелек и платежи */}
        <Accordion expanded={expandedSection === 'wallet'} onChange={handleSectionChange('wallet')}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <PaymentIcon sx={{ mr: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Кошелек и платежи
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Два типа баланса
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>1. Основной баланс:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - Для внутренних платежей на платформе
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - Пополнение через MBank
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - Оплата заказов, поднятие товаров, покупка тарифов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - НЕ ВЫВОДИТСЯ
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
                  <strong>2. Реферальный баланс:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - Заработок с реферальной программы
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - Доход с продаж товаров
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - МОЖНО ВЫВЕСТИ (минимум 1000 сом)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 2 }}>
                  - Можно перевести на основной баланс
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Типы транзакций
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Пополнение баланса через MBank
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Вывод средств
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Покупка товаров
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Оплата заказов
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Реферальные бонусы
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Поднятие товаров
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Покупка тарифа
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Перевод между балансами
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Безопасность */}
        <Accordion expanded={expandedSection === 'security'} onChange={handleSectionChange('security')}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <SecurityIcon sx={{ mr: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Безопасность и модерация
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Авторизация
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Google OAuth 2.0
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Telegram авторизация (Widget и WebApp)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Email + пароль (bcrypt шифрование)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - JWT tokens (access + refresh)
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Защита данных
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Персональные данные видны только владельцу
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Автоматическая маскировка телефонных номеров в чате
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Маскировка банковских карт
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Фильтрация нецензурной лексики в сообщениях
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Модерация товаров
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Все товары проходят модерацию перед публикацией
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Статусы: на модерации → активен / отклонен
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Проверка изображений и текста на соответствие правилам
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Система жалоб
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Возможность пожаловаться на товар, продавца или отзыв
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Причины: спам, неприемлемый контент, мошенничество, подделка
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  - Рассмотрение жалоб модераторами в течение 24 часов
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Дополнительные возможности */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} color="primary">
          Дополнительные возможности
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Чат и сообщения
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Приватные диалоги между пользователями" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Контекст товара (диалог привязан к товару)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Real-time обмен сообщениями" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary='Индикатор "печатает..." и статус онлайн' />
                </ListItem>
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Купоны и промокоды
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Создание купонов для своих товаров" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Скидка в процентах или фиксированная сумма" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Ограничение по количеству использований" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Минимальная сумма заказа для купона" />
                </ListItem>
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Услуги и бронирования
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Размещение услуг (мастера, косметологи и т.д.)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Бронирование даты и времени" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Подтверждение/отмена бронирования" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Отзывы после оказания услуги" />
                </ListItem>
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Экспорт данных
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Экспорт заказов в CSV" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Экспорт товаров в CSV" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Экспорт аналитики в JSON" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Комплексный отчет со всеми данными" />
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Контакты и поддержка */}
      <Paper sx={{ p: 4, bgcolor: 'primary.light' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Нужна помощь?
        </Typography>
        <Typography variant="body1" paragraph>
          Если у вас есть вопросы или нужна помощь, вы можете:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Посетить раздел Обучение"
              secondary={
                <MuiLink component={Link} to="/tutorials" underline="hover">
                  Перейти к обучению
                </MuiLink>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Связаться с поддержкой через чат на платформе" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Написать на email: support@bazarlar.online" />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default DocumentationPage;
