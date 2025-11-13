import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Description as DocIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const DocumentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Юридические документы
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Правила и условия использования платформы Bazarlar Online
        </Typography>
      </Box>

      <Paper>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Политика конфиденциальности" />
          <Tab icon={<GavelIcon />} iconPosition="start" label="Пользовательское соглашение" />
          <Tab icon={<DocIcon />} iconPosition="start" label="Правила размещения" />
        </Tabs>

        {/* Privacy Policy */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Политика конфиденциальности
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              Последнее обновление: 05 января 2025
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. Общие положения
            </Typography>
            <Typography paragraph>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
              пользователей платформы Bazarlar Online (далее — «Платформа»).
            </Typography>
            <Typography paragraph>
              Используя Платформу, вы соглашаетесь с условиями настоящей Политики конфиденциальности.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. Собираемые данные
            </Typography>
            <Typography paragraph>
              Мы собираем следующие категории персональных данных:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Имя и контактные данные (email, телефон)</li>
              <li>Информация о профиле (название магазина, описание, логотип)</li>
              <li>Данные авторизации через Google OAuth</li>
              <li>Информация о транзакциях и платежах</li>
              <li>История просмотров и покупок</li>
              <li>IP-адрес и данные о браузере</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              3. Цели обработки данных
            </Typography>
            <Typography paragraph>
              Ваши персональные данные обрабатываются для:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Предоставления доступа к функционалу Платформы</li>
              <li>Обработки платежей и финансовых операций</li>
              <li>Улучшения качества обслуживания</li>
              <li>Отправки уведомлений и информационных сообщений</li>
              <li>Предотвращения мошенничества</li>
              <li>Соблюдения законодательства Кыргызской Республики</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              4. Защита данных
            </Typography>
            <Typography paragraph>
              Мы применяем технические и организационные меры для защиты ваших данных:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Шифрование данных при передаче (TLS/SSL)</li>
              <li>Ограничение доступа к персональным данным</li>
              <li>Регулярное резервное копирование</li>
              <li>Мониторинг безопасности систем</li>
            </Typography>
            <Typography paragraph>
              <strong>Важно:</strong> Банковские реквизиты НЕ хранятся на наших серверах. Платежи обрабатываются
              через защищенный шлюз Мбанк.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              5. Передача данных третьим лицам
            </Typography>
            <Typography paragraph>
              Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Платежных систем для обработки транзакций</li>
              <li>Государственных органов по их законному запросу</li>
              <li>Поставщиков облачных услуг (с соблюдением конфиденциальности)</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              6. Ваши права
            </Typography>
            <Typography paragraph>
              Вы имеете право:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Запросить доступ к своим персональным данным</li>
              <li>Исправить неточные данные</li>
              <li>Удалить свой аккаунт и данные</li>
              <li>Ограничить обработку данных</li>
              <li>Отозвать согласие на обработку данных</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              7. Cookies и технологии отслеживания
            </Typography>
            <Typography paragraph>
              Платформа использует cookies для улучшения пользовательского опыта, аналитики и таргетированной
              рекламы. Вы можете отключить cookies в настройках браузера.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              8. Контактная информация
            </Typography>
            <Typography paragraph>
              По вопросам обработки персональных данных обращайтесь:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              Email: privacy@bazarlar.online<br />
              Адрес: г. Бишкек, Кыргызская Республика
            </Typography>
          </Box>
        </TabPanel>

        {/* User Agreement */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Пользовательское соглашение
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              Последнее обновление: 05 января 2025
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. Предмет соглашения
            </Typography>
            <Typography paragraph>
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между
              Администрацией платформы Bazarlar Online и пользователями Платформы.
            </Typography>
            <Typography paragraph>
              Регистрируясь на Платформе, вы принимаете условия настоящего Соглашения в полном объеме.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. Регистрация и аккаунт
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Регистрация осуществляется через Google OAuth</li>
              <li>Вы обязаны предоставлять достоверную информацию</li>
              <li>Один пользователь может иметь только один аккаунт</li>
              <li>Вы несете ответственность за безопасность своего аккаунта</li>
              <li>Запрещена передача аккаунта третьим лицам</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              3. Тарифные планы
            </Typography>
            <Typography paragraph>
              Платформа предлагает три тарифных плана:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li><strong>Free:</strong> Бесплатный тариф с ограничениями (до 10 товаров)</li>
              <li><strong>Pro:</strong> 500 сом/месяц (до 100 товаров, автоподнятие)</li>
              <li><strong>Business:</strong> 2000 сом/месяц (до 1000 товаров, партнерская программа)</li>
            </Typography>
            <Typography paragraph>
              Оплата тарифа производится через внутренний кошелек Платформы.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              4. Правила размещения товаров и услуг
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Запрещено размещение запрещенных товаров (оружие, наркотики, контрафакт)</li>
              <li>Все товары проходят модерацию перед публикацией</li>
              <li>Изображения не должны содержать запрещенного контента</li>
              <li>Описания должны быть правдивыми и не вводить в заблуждение</li>
              <li>Запрещено указывать контакты в описании товара</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              5. Финансовые операции
            </Typography>
            <Typography paragraph>
              <strong>5.1. Кошелек</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Основной баланс используется для внутренних платежей</li>
              <li>Реферальный баланс можно выводить (минимум 3000 сом)</li>
              <li>Вывод средств осуществляется на Мбанк</li>
            </Typography>

            <Typography paragraph sx={{ mt: 2 }}>
              <strong>5.2. Партнерская программа</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Реферальные начисления: 10% от пополнений рефералов</li>
              <li>Партнерские комиссии: 40% от партнерского процента товара</li>
              <li>Минимальный партнерский процент: 2%</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              6. Ответственность сторон
            </Typography>
            <Typography paragraph>
              <strong>6.1. Администрация:</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Обеспечивает работоспособность Платформы</li>
              <li>Модерирует контент</li>
              <li>Обрабатывает финансовые операции</li>
              <li>Не несет ответственности за качество товаров продавцов</li>
            </Typography>

            <Typography paragraph sx={{ mt: 2 }}>
              <strong>6.2. Пользователь:</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Соблюдает условия Соглашения</li>
              <li>Несет ответственность за размещаемый контент</li>
              <li>Обеспечивает выполнение заказов (для продавцов)</li>
              <li>Своевременно оплачивает выбранный тариф</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              7. Блокировка аккаунта
            </Typography>
            <Typography paragraph>
              Администрация вправе заблокировать аккаунт в случае:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Нарушения условий Соглашения</li>
              <li>Мошеннических действий</li>
              <li>Размещения запрещенного контента</li>
              <li>Массовых жалоб от других пользователей</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              8. Изменение условий
            </Typography>
            <Typography paragraph>
              Администрация вправе изменять условия Соглашения. Продолжение использования Платформы после
              внесения изменений означает ваше согласие с новыми условиями.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              9. Применимое право
            </Typography>
            <Typography paragraph>
              Настоящее Соглашение регулируется законодательством Кыргызской Республики.
              Споры разрешаются в судебном порядке по месту нахождения Администрации.
            </Typography>
          </Box>
        </TabPanel>

        {/* Listing Rules */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Правила размещения товаров и услуг
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              Последнее обновление: 05 января 2025
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. Общие требования
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Все объявления проходят автоматическую и ручную модерацию</li>
              <li>Время модерации: до 24 часов</li>
              <li>Запрещено размещение дубликатов</li>
              <li>Один товар = одно объявление</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. Требования к изображениям
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Формат: JPEG, PNG</li>
              <li>Размер: до 10 изображений на товар</li>
              <li>Разрешение: минимум 350x350 пикселей</li>
              <li>Фото должны соответствовать описанию товара</li>
              <li>Запрещены водяные знаки с контактами</li>
              <li>Запрещены изображения с текстом номеров телефонов</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              3. Требования к описанию
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Название: до 100 символов</li>
              <li>Описание: до 2000 символов</li>
              <li>Указывайте реальные характеристики товара</li>
              <li>Запрещена нецензурная лексика</li>
              <li>Запрещено указывать контакты (номера телефонов, email, мессенджеры)</li>
              <li>Для связи используйте встроенный чат</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              4. Цены и скидки
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Указывайте реальную цену</li>
              <li>Запрещены необоснованные завышения цен со скидками</li>
              <li>Цены указываются в сомах (KGS)</li>
              <li>Скидка рассчитывается автоматически</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              5. Запрещенные категории товаров
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Оружие, боеприпасы, взрывчатые вещества</li>
              <li>Наркотические вещества</li>
              <li>Контрафактная продукция</li>
              <li>Украденные товары</li>
              <li>Табачная и алкогольная продукция (без лицензии)</li>
              <li>Медицинские препараты (без лицензии)</li>
              <li>Документы, удостоверения</li>
              <li>Эротический и порнографический контент</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              6. Модерация
            </Typography>
            <Typography paragraph>
              <strong>Автоматическая модерация (AI):</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Проверка изображений на запрещенный контент</li>
              <li>Фильтрация нецензурной лексики в текстах</li>
              <li>Обнаружение контактов в описаниях</li>
            </Typography>

            <Typography paragraph sx={{ mt: 2 }}>
              <strong>Ручная модерация:</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Проверка товаров, отмеченных AI</li>
              <li>Обработка жалоб пользователей</li>
              <li>Решение спорных ситуаций</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              7. Санкции за нарушения
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li><strong>Предупреждение:</strong> первое нарушение</li>
              <li><strong>Блокировка объявления:</strong> повторное нарушение</li>
              <li><strong>Временная блокировка аккаунта:</strong> систематические нарушения</li>
              <li><strong>Постоянная блокировка:</strong> размещение запрещенного контента, мошенничество</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              8. Поднятие объявлений
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <li>Ручное поднятие: от 10 до 20 сом (зависит от тарифа)</li>
              <li>Автоподнятие: доступно на тарифах Pro и Business</li>
              <li>Минимальный интервал автоподнятия: 30 минут</li>
              <li>Поднятые объявления отображаются выше в списке</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              9. Контакты службы поддержки
            </Typography>
            <Typography paragraph>
              По вопросам модерации обращайтесь:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              Email: support@bazarlar.online<br />
              Время ответа: в течение 24 часов
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default DocumentsPage;
