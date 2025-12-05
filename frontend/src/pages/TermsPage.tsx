import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';

const TermsPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Пользовательское соглашение
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          1. Общие положения
        </Typography>
        <Typography variant="body1" paragraph>
          Настоящее Пользовательское соглашение регулирует отношения между платформой
          Bazarlar Online (далее - "Платформа") и пользователями.
        </Typography>
        <Typography variant="body1">
          Регистрируясь на Платформе, вы соглашаетесь с условиями данного соглашения.
          Если вы не согласны с какими-либо условиями, пожалуйста, не используйте Платформу.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          2. Регистрация и учетная запись
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Для использования некоторых функций требуется регистрация
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Вы обязаны предоставлять точную и актуальную информацию
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Вы несете ответственность за сохранность данных вашей учетной записи
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Запрещается создавать несколько учетных записей для одного лица
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          3. Правила размещения товаров и услуг
        </Typography>
        <Typography variant="body1" paragraph>
          Продавцы обязаны:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Размещать только легальные товары и услуги
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Предоставлять точное описание и фотографии товаров
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Указывать корректные цены
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Своевременно обрабатывать заказы
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Не размещать запрещенные товары (оружие, наркотики, контрафакт и т.д.)
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          4. Тарифы и платежи
        </Typography>
        <Typography variant="body1" paragraph>
          Платформа предлагает три тарифных плана: Free, Pro и Business.
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Тарифы Pro и Business требуют минимального баланса, который НЕ списывается
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Тариф автоматически продлевается при наличии достаточного баланса
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Продвижение товаров оплачивается отдельно согласно тарифу
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Средства на счете могут быть использованы для продвижения или покупок
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          5. Реферальная программа
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Для пользователей:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Получайте 5% кэшбек с каждого пополнения баланса ваших рефералов
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Кэшбек начисляется в течение одного года с момента регистрации реферала
            </Typography>
          </li>
        </Box>
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          <strong>Для продавцов (тариф Business):</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Устанавливайте комиссию от 1% до 50% для партнеров
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Партнер получает 45% комиссии, продавец - 55%
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Комиссия списывается после подтверждения заказа
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          6. Заказы и доставка
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Оплата товаров производится наличными при получении
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Покупатель может отменить заказ в статусе "Ожидает"
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Продавец обязан связаться с покупателем после получения заказа
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Условия доставки согласовываются между продавцом и покупателем
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          7. Ответственность
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Платформа не несет ответственности за качество товаров и услуг
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Продавцы несут полную ответственность за свои товары и услуги
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Платформа не участвует в расчетах между покупателями и продавцами
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Споры решаются напрямую между покупателем и продавцом
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          8. Запрещенные действия
        </Typography>
        <Typography variant="body1" paragraph>
          Запрещается:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Размещать незаконные товары и услуги
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Использовать мошеннические схемы
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Накручивать рейтинги и отзывы
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Спамить и рассылать нежелательные сообщения
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Нарушать права других пользователей
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          9. Блокировка и удаление аккаунта
        </Typography>
        <Typography variant="body1" paragraph>
          Платформа оставляет за собой право заблокировать или удалить аккаунт при нарушении
          условий соглашения без предварительного уведомления.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          10. Изменения соглашения
        </Typography>
        <Typography variant="body1" paragraph>
          Платформа может изменять условия соглашения. О существенных изменениях пользователи
          будут уведомлены по email или через уведомления на платформе.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          11. Контакты
        </Typography>
        <Typography variant="body1" paragraph>
          По вопросам соглашения обращайтесь:
        </Typography>
        <Typography variant="body1">
          Email: support@bazarlaronline.kg
        </Typography>
      </Paper>
    </Container>
  );
};

export default TermsPage;
