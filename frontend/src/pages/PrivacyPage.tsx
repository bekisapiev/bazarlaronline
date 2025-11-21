import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const PrivacyPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Политика конфиденциальности
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ '& > *': { mb: 3 } }}>
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              1. Общие положения
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных
              данных пользователей платформы Bazarlar Online (далее — «Платформа»).
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Используя Платформу, вы соглашаетесь с условиями данной Политики конфиденциальности.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              2. Собираемые данные
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Мы собираем следующие типы информации:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Персональные данные: имя, email, номер телефона, Telegram ID</li>
                <li>Данные профиля: фотография, описание, рейтинг</li>
                <li>Информация о товарах и услугах: названия, описания, цены, фотографии</li>
                <li>Данные о транзакциях: история заказов, платежи, отзывы</li>
                <li>Технические данные: IP-адрес, тип устройства, браузер, cookies</li>
                <li>Данные геолокации: город, рынок, адрес доставки</li>
              </ul>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              3. Использование данных
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Мы используем собранные данные для:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Предоставления и улучшения услуг Платформы</li>
                <li>Обработки заказов и платежей</li>
                <li>Связи с пользователями (уведомления, поддержка)</li>
                <li>Персонализации контента и рекомендаций</li>
                <li>Аналитики и статистики использования</li>
                <li>Предотвращения мошенничества и обеспечения безопасности</li>
                <li>Соблюдения законодательства</li>
              </ul>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              4. Защита данных
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Мы применяем современные технологии и организационные меры для защиты ваших данных:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Шифрование данных при передаче (SSL/TLS)</li>
                <li>Безопасное хранение данных в защищенных дата-центрах</li>
                <li>Ограничение доступа к персональным данным</li>
                <li>Регулярное тестирование систем безопасности</li>
                <li>Обучение персонала вопросам защиты данных</li>
              </ul>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              5. Передача данных третьим лицам
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Мы можем передавать ваши данные следующим категориям получателей:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Поставщикам платежных услуг (для обработки платежей)</li>
                <li>Курьерским службам (для доставки заказов)</li>
                <li>Сервисам аналитики (Google Analytics, Яндекс.Метрика)</li>
                <li>Государственным органам (по требованию законодательства)</li>
              </ul>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Мы НЕ продаем и не передаем ваши персональные данные третьим лицам в маркетинговых целях.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              6. Cookies и похожие технологии
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Мы используем cookies для улучшения работы Платформы:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Необходимые cookies (для авторизации и безопасности)</li>
                <li>Функциональные cookies (для сохранения настроек)</li>
                <li>Аналитические cookies (для улучшения сервиса)</li>
              </ul>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Вы можете управлять cookies в настройках вашего браузера.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              7. Ваши права
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Вы имеете следующие права в отношении ваших данных:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Право на доступ к своим данным</li>
                <li>Право на исправление неточных данных</li>
                <li>Право на удаление данных («право на забвение»)</li>
                <li>Право на ограничение обработки</li>
                <li>Право на экспорт данных</li>
                <li>Право на отзыв согласия</li>
                <li>Право на подачу жалобы в надзорный орган</li>
              </ul>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Для реализации своих прав обращайтесь по адресу: support@bazarlar.online
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              8. Хранение данных
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Мы храним ваши персональные данные столько времени, сколько необходимо для достижения
              целей, указанных в настоящей Политике, или в соответствии с требованиями законодательства.
              После удаления аккаунта ваши данные будут удалены в течение 30 дней.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              9. Дети
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Платформа не предназначена для лиц младше 18 лет. Мы сознательно не собираем данные детей.
              Если вам стало известно, что ребенок предоставил нам персональные данные, пожалуйста,
              свяжитесь с нами.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              10. Изменения в Политике
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Мы можем обновлять настоящую Политику конфиденциальности. О существенных изменениях
              мы будем уведомлять вас по email или через уведомления на Платформе. Рекомендуем
              периодически проверять эту страницу на наличие обновлений.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              11. Контакты
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              По вопросам, связанным с обработкой персональных данных, обращайтесь:
              <ul>
                <li>Email: support@bazarlar.online</li>
                <li>Телефон: +996 555 123 456</li>
                <li>Telegram: @bazarlar_support</li>
              </ul>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPage;
