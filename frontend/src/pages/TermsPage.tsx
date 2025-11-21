import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const TermsPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Условия использования
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ '& > *': { mb: 3 } }}>
          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              1. Принятие условий
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Настоящие Условия использования (далее — «Условия») регулируют использование платформы
              Bazarlar Online (далее — «Платформа»). Используя Платформу, вы соглашаетесь с
              настоящими Условиями. Если вы не согласны с Условиями, пожалуйста, не используйте Платформу.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              2. Описание сервиса
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Bazarlar Online — это онлайн-платформа, которая:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Объединяет продавцов и покупателей товаров и услуг</li>
                <li>Предоставляет инструменты для размещения объявлений</li>
                <li>Обеспечивает коммуникацию между пользователями</li>
                <li>Предлагает платежные и аналитические сервисы</li>
              </ul>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              3. Регистрация и аккаунт
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>3.1.</strong> Для использования полного функционала Платформы необходимо создать аккаунт.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>3.2.</strong> Вы обязуетесь предоставлять точную и актуальную информацию при регистрации.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>3.3.</strong> Вы несете ответственность за сохранность данных вашего аккаунта.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>3.4.</strong> Запрещается передавать доступ к аккаунту третьим лицам.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              4. Правила для продавцов
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>4.1. Размещение товаров/услуг:</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Информация должна быть точной и полной</li>
                <li>Фотографии должны соответствовать реальному товару</li>
                <li>Цены должны быть актуальными</li>
                <li>Запрещено размещать запрещенные законом товары</li>
              </ul>
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>4.2. Запрещенные товары и услуги:</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Наркотические вещества и психотропы</li>
                <li>Оружие и боеприпасы</li>
                <li>Контрафактная продукция</li>
                <li>Пиратское программное обеспечение</li>
                <li>Услуги сексуального характера</li>
                <li>Финансовые пирамиды и мошеннические схемы</li>
              </ul>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>4.3.</strong> Продавцы обязаны своевременно отвечать на запросы покупателей и выполнять заказы.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              5. Правила для покупателей
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Уважительное общение с продавцами</li>
                <li>Своевременная оплата заказов</li>
                <li>Честные и объективные отзывы</li>
                <li>Запрещены необоснованные претензии и шантаж</li>
              </ul>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              6. Платежи и тарифы
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>6.1.</strong> Платформа предлагает бесплатный тариф и платные тарифы (Pro, Business).
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>6.2.</strong> Оплата осуществляется через интегрированные платежные системы.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>6.3.</strong> При покупке платного тарифа возврат средств не производится, за исключением
              случаев, предусмотренных законодательством.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>6.4.</strong> Платформа взимает комиссию с продаж согласно выбранному тарифу.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              7. Интеллектуальная собственность
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>7.1.</strong> Все материалы Платформы (дизайн, логотипы, тексты) защищены авторским правом.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>7.2.</strong> Пользователи сохраняют права на контент, который они размещают, но предоставляют
              Платформе лицензию на его использование для предоставления сервиса.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>7.3.</strong> Запрещено копирование и распространение материалов Платформы без разрешения.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              8. Ответственность
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>8.1.</strong> Платформа выступает посредником и не несет ответственности за:
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Качество товаров и услуг</li>
                <li>Действия или бездействие продавцов/покупателей</li>
                <li>Споры между пользователями</li>
              </ul>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>8.2.</strong> Пользователи несут полную ответственность за свои действия на Платформе.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              9. Модерация и блокировка
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>9.1.</strong> Платформа оставляет за собой право модерировать контент и удалять нарушающие
              материалы.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>9.2.</strong> За нарушение Условий аккаунт может быть заблокирован без предварительного уведомления.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>9.3.</strong> При блокировке средства на балансе могут быть заморожены до выяснения обстоятельств.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              10. Отзывы и рейтинги
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              <ul>
                <li>Отзывы должны быть честными и основанными на реальном опыте</li>
                <li>Запрещены поддельные отзывы и накрутка рейтинга</li>
                <li>Платформа может удалять подозрительные отзывы</li>
                <li>Продавцы могут отвечать на отзывы</li>
              </ul>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              11. Разрешение споров
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>11.1.</strong> При возникновении споров стороны должны попытаться решить их мирным путем.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>11.2.</strong> Платформа может выступать посредником в разрешении споров.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>11.3.</strong> Неразрешенные споры рассматриваются в судебном порядке согласно
              законодательству Кыргызской Республики.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              12. Изменение условий
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Платформа оставляет за собой право изменять настоящие Условия. О существенных изменениях
              пользователи будут уведомлены заранее. Продолжение использования Платформы после внесения
              изменений означает принятие новых Условий.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              13. Контакты
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              По вопросам, связанным с Условиями использования:
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

export default TermsPage;
