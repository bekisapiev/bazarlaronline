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

const TermsPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Пользовательское соглашение</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Пользовательское соглашение
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
            Настоящее Пользовательское соглашение (далее - "Соглашение") регулирует отношения
            между администрацией платформы Bazarlar Online (далее - "Платформа") и
            пользователями Платформы (далее - "Пользователь").
          </Typography>
          <Typography variant="body1" paragraph>
            Регистрируясь и используя Платформу, Пользователь подтверждает, что полностью
            ознакомлен с условиями настоящего Соглашения и принимает их в полном объеме.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            2. Регистрация и учетная запись
          </Typography>
          <Typography variant="body1" paragraph>
            2.1. Для использования полного функционала Платформы необходимо пройти регистрацию.
          </Typography>
          <Typography variant="body1" paragraph>
            2.2. При регистрации Пользователь обязуется предоставить достоверную и актуальную
            информацию о себе.
          </Typography>
          <Typography variant="body1" paragraph>
            2.3. Пользователь несет ответственность за сохранность своих учетных данных и
            не должен передавать их третьим лицам.
          </Typography>
          <Typography variant="body1" paragraph>
            2.4. Администрация Платформы оставляет за собой право отказать в регистрации или
            заблокировать учетную запись без объяснения причин.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            3. Права и обязанности Пользователя
          </Typography>
          <Typography variant="body1" paragraph fontWeight={600}>
            Пользователь имеет право:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Размещать объявления о продаже товаров и услуг</li>
              <li>Просматривать объявления других пользователей</li>
              <li>Использовать систему обмена сообщениями</li>
              <li>Оставлять отзывы о продавцах и товарах</li>
              <li>Использовать все доступные функции Платформы</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph fontWeight={600} sx={{ mt: 2 }}>
            Пользователь обязуется:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Соблюдать законодательство Кыргызской Республики</li>
              <li>Не размещать запрещенные товары и услуги</li>
              <li>Предоставлять достоверную информацию о товарах</li>
              <li>Не публиковать оскорбительный или незаконный контент</li>
              <li>Уважать права других пользователей</li>
              <li>Своевременно обновлять информацию в профиле</li>
            </ul>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            4. Размещение объявлений
          </Typography>
          <Typography variant="body1" paragraph>
            4.1. Пользователь несет полную ответственность за содержание своих объявлений.
          </Typography>
          <Typography variant="body1" paragraph>
            4.2. Запрещено размещение объявлений о продаже:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Наркотических средств и психотропных веществ</li>
              <li>Оружия и боеприпасов</li>
              <li>Поддельных или контрафактных товаров</li>
              <li>Товаров, нарушающих авторские права</li>
              <li>Краденых вещей</li>
              <li>Услуг интимного характера</li>
              <li>Других запрещенных законом товаров и услуг</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph>
            4.3. Администрация оставляет за собой право удалять объявления, нарушающие
            настоящее Соглашение, без предварительного уведомления.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            5. Платежи и тарифы
          </Typography>
          <Typography variant="body1" paragraph>
            5.1. Базовые функции Платформы предоставляются бесплатно.
          </Typography>
          <Typography variant="body1" paragraph>
            5.2. Дополнительные возможности (продвижение объявлений, премиум-аккаунт)
            предоставляются на платной основе в соответствии с действующими тарифами.
          </Typography>
          <Typography variant="body1" paragraph>
            5.3. Оплата производится через доступные платежные системы.
          </Typography>
          <Typography variant="body1" paragraph>
            5.4. Возврат средств возможен только в случаях, предусмотренных законодательством
            или настоящим Соглашением.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            6. Интеллектуальная собственность
          </Typography>
          <Typography variant="body1" paragraph>
            6.1. Все материалы Платформы (дизайн, логотипы, программный код) являются
            собственностью Администрации и защищены законом об авторских правах.
          </Typography>
          <Typography variant="body1" paragraph>
            6.2. Пользователь сохраняет права на контент, который размещает на Платформе,
            но предоставляет Администрации право использовать этот контент для работы
            Платформы.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            7. Ответственность сторон
          </Typography>
          <Typography variant="body1" paragraph>
            7.1. Администрация не несет ответственности за:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Качество товаров и услуг, предлагаемых продавцами</li>
              <li>Действия пользователей на Платформе</li>
              <li>Убытки, возникшие в результате использования Платформы</li>
              <li>Технические сбои и перерывы в работе</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph>
            7.2. Пользователь несет ответственность за нарушение условий Соглашения в
            соответствии с действующим законодательством.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            8. Разрешение споров
          </Typography>
          <Typography variant="body1" paragraph>
            8.1. Все споры между Пользователем и Администрацией решаются путем переговоров.
          </Typography>
          <Typography variant="body1" paragraph>
            8.2. В случае недостижения согласия споры подлежат рассмотрению в судебном
            порядке в соответствии с законодательством Кыргызской Республики.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            9. Изменение условий Соглашения
          </Typography>
          <Typography variant="body1" paragraph>
            9.1. Администрация оставляет за собой право изменять условия настоящего
            Соглашения в одностороннем порядке.
          </Typography>
          <Typography variant="body1" paragraph>
            9.2. Новая редакция Соглашения вступает в силу с момента ее размещения на
            Платформе, если иное не предусмотрено новой редакцией.
          </Typography>
          <Typography variant="body1" paragraph>
            9.3. Продолжение использования Платформы после внесения изменений означает
            согласие Пользователя с новыми условиями.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            10. Заключительные положения
          </Typography>
          <Typography variant="body1" paragraph>
            10.1. Настоящее Соглашение регулируется законодательством Кыргызской Республики.
          </Typography>
          <Typography variant="body1" paragraph>
            10.2. Если какое-либо положение Соглашения будет признано недействительным,
            остальные положения сохраняют свою силу.
          </Typography>
          <Typography variant="body1" paragraph>
            10.3. Бездействие Администрации в случае нарушения Пользователем условий
            Соглашения не лишает Администрацию права предпринять соответствующие действия
            позже.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            11. Контактная информация
          </Typography>
          <Typography variant="body1" paragraph>
            По всем вопросам, связанным с настоящим Соглашением, вы можете обращаться:
          </Typography>
          <Typography variant="body1" component="div" sx={{ pl: 3 }}>
            <ul>
              <li>Email: legal@bazarlar.kg</li>
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

export default TermsPage;
