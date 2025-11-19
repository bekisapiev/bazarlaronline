import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Политика конфиденциальности</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Политика конфиденциальности
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            1. Общие положения
          </Typography>
          <Typography variant="body1" paragraph>
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты
            персональных данных пользователей платформы Bazarlar Online (далее - "Платформа").
            Используя Платформу, вы соглашаетесь с условиями данной Политики.
          </Typography>
          <Typography variant="body1" paragraph>
            Администрация Платформы обязуется соблюдать конфиденциальность персональных
            данных пользователей и обеспечивать их защиту в соответствии с действующим
            законодательством Кыргызской Республики.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            2. Собираемая информация
          </Typography>
          <Typography variant="body1" paragraph>
            При использовании Платформы мы можем собирать следующую информацию:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Имя, фамилия и контактные данные (телефон, email)</li>
              <li>Информация о местоположении (город, адрес доставки)</li>
              <li>Данные о транзакциях и покупках</li>
              <li>История просмотров и взаимодействия с Платформой</li>
              <li>IP-адрес, тип браузера и устройства</li>
              <li>Файлы cookie для улучшения работы сайта</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            3. Использование информации
          </Typography>
          <Typography variant="body1" paragraph>
            Собранная информация используется для следующих целей:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Предоставление доступа к функциям Платформы</li>
              <li>Обработка заказов и платежей</li>
              <li>Улучшение качества обслуживания и пользовательского опыта</li>
              <li>Отправка уведомлений о заказах, новостях и специальных предложениях</li>
              <li>Предотвращение мошенничества и обеспечение безопасности</li>
              <li>Проведение аналитики и статистических исследований</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            4. Защита данных
          </Typography>
          <Typography variant="body1" paragraph>
            Мы применяем современные технологии и меры безопасности для защиты ваших
            персональных данных:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Шифрование данных при передаче (SSL/TLS)</li>
              <li>Ограниченный доступ к персональным данным сотрудников</li>
              <li>Регулярные проверки безопасности систем</li>
              <li>Резервное копирование данных</li>
              <li>Использование безопасных платежных систем</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            5. Передача данных третьим лицам
          </Typography>
          <Typography variant="body1" paragraph>
            Мы не продаем и не передаем ваши персональные данные третьим лицам, за
            исключением следующих случаев:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Для выполнения заказов (доставка, оплата)</li>
              <li>По требованию уполномоченных государственных органов</li>
              <li>С вашего явного согласия</li>
              <li>Для предотвращения мошенничества или нарушений</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            6. Файлы cookie
          </Typography>
          <Typography variant="body1" paragraph>
            Наш сайт использует файлы cookie для улучшения пользовательского опыта.
            Cookie - это небольшие текстовые файлы, которые сохраняются на вашем устройстве
            и помогают нам запоминать ваши предпочтения и анализировать использование сайта.
          </Typography>
          <Typography variant="body1" paragraph>
            Вы можете отключить cookie в настройках вашего браузера, но это может
            ограничить функциональность Платформы.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            7. Ваши права
          </Typography>
          <Typography variant="body1" paragraph>
            Вы имеете право:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Получать доступ к своим персональным данным</li>
              <li>Исправлять неточные или неполные данные</li>
              <li>Удалить свои персональные данные</li>
              <li>Ограничить обработку данных</li>
              <li>Возражать против обработки данных</li>
              <li>Получить копию своих данных</li>
              <li>Отозвать согласие на обработку данных</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            8. Хранение данных
          </Typography>
          <Typography variant="body1" paragraph>
            Мы храним ваши персональные данные только в течение необходимого срока для
            выполнения целей, указанных в данной Политике, или в соответствии с требованиями
            законодательства. После окончания этого срока данные удаляются или обезличиваются.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            9. Изменения в Политике
          </Typography>
          <Typography variant="body1" paragraph>
            Мы оставляем за собой право вносить изменения в настоящую Политику
            конфиденциальности. Все изменения вступают в силу с момента их публикации на
            Платформе. Мы рекомендуем периодически просматривать эту страницу для
            ознакомления с актуальной версией Политики.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            10. Контактная информация
          </Typography>
          <Typography variant="body1" paragraph>
            Если у вас есть вопросы или замечания относительно настоящей Политики
            конфиденциальности, вы можете связаться с нами:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Email: privacy@bazarlar.kg</li>
              <li>Телефон: +996 (555) 123-456</li>
              <li>Адрес: г. Бишкек, ул. Чуй 123, офис 45</li>
            </ul>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Bazarlar Online. Все права защищены.
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrivacyPage;
