import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';

const PrivacyPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Политика конфиденциальности
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          1. Сбор информации
        </Typography>
        <Typography variant="body1" paragraph>
          Мы собираем информацию, которую вы предоставляете при регистрации и использовании
          платформы Bazarlar Online:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Личные данные:</strong> имя, номер телефона, email, дата рождения
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Информация о продавце:</strong> название магазина, адрес, реквизиты
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Данные использования:</strong> информация о ваших действиях на платформе,
              просмотренные товары, заказы
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Финансовая информация:</strong> история транзакций, баланс счета
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          2. Использование информации
        </Typography>
        <Typography variant="body1" paragraph>
          Мы используем собранную информацию для:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Предоставления и улучшения наших услуг
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Обработки заказов и транзакций
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Связи с вами по вопросам заказов и уведомлений
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Предотвращения мошенничества и обеспечения безопасности
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Соблюдения законодательных требований
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          3. Защита данных
        </Typography>
        <Typography variant="body1" paragraph>
          Мы применяем современные технические и организационные меры для защиты ваших данных:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Шифрование данных при передаче (SSL/TLS)
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Защищенные серверы и базы данных
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Ограниченный доступ к персональным данным
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Регулярные проверки безопасности
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          4. Передача данных третьим лицам
        </Typography>
        <Typography variant="body1" paragraph>
          Мы не продаем ваши персональные данные. Мы можем передавать данные только в следующих случаях:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              С вашего согласия
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Для обработки платежей (платежные системы)
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Для доставки товаров (службы доставки)
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              По требованию законодательства
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          5. Ваши права
        </Typography>
        <Typography variant="body1" paragraph>
          Вы имеете право:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body1" paragraph>
              Получать доступ к своим персональным данным
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Исправлять неточные данные
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Удалять свои данные (при условии отсутствия активных обязательств)
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Ограничивать обработку данных
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              Возражать против обработки данных
            </Typography>
          </li>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          6. Cookies
        </Typography>
        <Typography variant="body1" paragraph>
          Мы используем cookies для улучшения работы сайта и персонализации контента.
          Вы можете управлять cookies через настройки браузера.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          7. Изменения политики
        </Typography>
        <Typography variant="body1" paragraph>
          Мы можем обновлять эту политику конфиденциальности. О существенных изменениях мы будем
          уведомлять вас по email или через уведомления на платформе.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          8. Контакты
        </Typography>
        <Typography variant="body1" paragraph>
          По вопросам конфиденциальности обращайтесь:
        </Typography>
        <Typography variant="body1">
          Email: privacy@bazarlaronline.kg
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrivacyPage;
