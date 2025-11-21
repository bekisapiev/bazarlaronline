# Frontend - Telegram Authentication Setup

## Обзор

Frontend поддерживает **3 метода авторизации**:

1. **Google OAuth** - вход через Google
2. **Telegram Login Widget** - кнопка "Login with Telegram" (рекомендуется)
3. **Telegram Code Auth** - код верификации в Telegram

---

## Настройка

### 1. Установка зависимостей

```bash
cd frontend
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Google OAuth Client ID (получить в Google Cloud Console)
REACT_APP_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# Telegram Bot Username (без @)
REACT_APP_TELEGRAM_BOT_USERNAME=bazarlar_online_bot
```

### 3. Получить Google Client ID

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Создайте **OAuth 2.0 Client ID**
5. Добавьте authorized origins:
   - `http://localhost:3000`
   - `http://localhost:8000`
6. Скопируйте Client ID в `.env`

### 4. Настроить Telegram бота

См. инструкции в [TELEGRAM_SETUP.md](../TELEGRAM_SETUP.md) в корне проекта.

**Важно:** Username бота должен совпадать с `REACT_APP_TELEGRAM_BOT_USERNAME` в `.env`

---

## Запуск приложения

```bash
npm start
```

Откройте http://localhost:3000/login для проверки авторизации.

---

## Компоненты

### TelegramLoginWidget

**Путь:** `src/components/auth/TelegramLoginWidget.tsx`

Официальный виджет от Telegram. Отображает кнопку "Login with Telegram".

**Props:**
- `botUsername` (required) - username бота без @
- `buttonSize` - размер кнопки: 'large' | 'medium' | 'small' (default: 'large')
- `cornerRadius` - радиус углов кнопки
- `requestAccess` - запрос доступа: 'write' (default)
- `usePic` - показывать аватар пользователя (default: true)
- `lang` - язык виджета (default: 'ru')

**Пример:**
```tsx
<TelegramLoginWidget
  botUsername="bazarlar_online_bot"
  buttonSize="large"
  requestAccess="write"
/>
```

**Как работает:**
1. Пользователь нажимает кнопку
2. Открывается Telegram с запросом авторизации
3. После подтверждения данные отправляются в `window.onTelegramAuth`
4. Компонент отправляет данные на backend `/api/v1/auth/telegram/widget`
5. Backend проверяет hash и возвращает JWT токены
6. Пользователь перенаправляется на главную страницу

### TelegramCodeAuth

**Путь:** `src/components/auth/TelegramCodeAuth.tsx`

Двухэтапная авторизация через код в Telegram.

**Шаг 1: Запрос кода**
- Пользователь вводит Telegram ID и телефон
- Код отправляется в Telegram бот
- Код действителен 10 минут

**Шаг 2: Ввод кода**
- Пользователь вводит 6-значный код
- Backend проверяет код и возвращает токены

**Пример использования:**
```tsx
<TelegramCodeAuth />
```

**Как узнать Telegram ID:**
1. Откройте бота [@userinfobot](https://t.me/userinfobot)
2. Отправьте любое сообщение
3. Бот вернет ваш ID

---

## LoginPage

**Путь:** `src/pages/LoginPage.tsx`

Страница авторизации с тремя методами входа.

**Структура:**
1. Google Login Button
2. Разделитель "или"
3. Tabs для выбора метода Telegram авторизации:
   - **Telegram кнопка** - TelegramLoginWidget
   - **Код в Telegram** - TelegramCodeAuth

---

## API сервис

**Путь:** `src/services/api.ts`

Добавлены методы для Telegram авторизации:

```typescript
authAPI.telegramWidget(data: {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
})

authAPI.telegramRequestCode(telegram_id: string, phone: string)

authAPI.telegramVerifyCode(data: {
  telegram_id: string;
  phone: string;
  code: string;
  telegram_username?: string;
  full_name?: string;
})

authAPI.telegramWebApp(init_data: string) // Для Telegram Mini Apps
```

---

## Redux Store

**Путь:** `src/store/slices/authSlice.ts`

Добавлены новые поля в интерфейс `User`:
- `phone?: string`
- `telegram_id?: string`
- `telegram_username?: string`

---

## Тестирование

### 1. Telegram Login Widget

1. Запустите приложение: `npm start`
2. Откройте http://localhost:3000/login
3. Выберите вкладку "Telegram кнопка"
4. Нажмите на кнопку Telegram
5. Подтвердите авторизацию в Telegram
6. Проверьте, что произошел редирект на главную страницу

### 2. Telegram Code Auth

1. Откройте http://localhost:3000/login
2. Выберите вкладку "Код в Telegram"
3. Узнайте свой Telegram ID через [@userinfobot](https://t.me/userinfobot)
4. Введите Telegram ID и телефон (+996XXXXXXXXX)
5. Нажмите "Получить код"
6. Проверьте код в Telegram боте
7. Введите код и нажмите "Войти"

### 3. Проверка токенов

Откройте DevTools → Application → Local Storage:
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token

---

## Troubleshooting

### Ошибка: "onTelegramAuth is not a function"

**Причина:** Скрипт виджета загружен раньше, чем установлен callback

**Решение:** Перезагрузите страницу. Компонент правильно обрабатывает порядок загрузки.

### Ошибка: "Failed to send verification code"

**Причина:** Пользователь не написал боту первым

**Решение:**
1. Откройте вашего бота в Telegram
2. Отправьте команду `/start`
3. Попробуйте запросить код снова

### Ошибка: "Invalid Telegram authentication data"

**Причина:** Bot username не совпадает или токен не настроен

**Решение:**
1. Проверьте `REACT_APP_TELEGRAM_BOT_USERNAME` в `.env`
2. Проверьте `TELEGRAM_BOT_TOKEN` в backend `.env`
3. Убедитесь, что domain настроен в BotFather (`/setdomain`)

### Виджет не отображается

**Причина:** Неверный bot username или скрипт не загрузился

**Решение:**
1. Проверьте username в `.env` (без @)
2. Откройте DevTools → Network и проверьте загрузку `telegram-widget.js`
3. Проверьте CORS в backend

---

## Production Deployment

### 1. Обновите переменные окружения

```env
REACT_APP_API_URL=https://api.bazarlar.online
REACT_APP_GOOGLE_CLIENT_ID=production-client-id
REACT_APP_TELEGRAM_BOT_USERNAME=bazarlar_bot
```

### 2. Настройте Google OAuth

Добавьте production домены в Google Cloud Console:
- `https://bazarlar.online`
- `https://www.bazarlar.online`

### 3. Настройте Telegram бота

В BotFather выполните:
```
/setdomain
@bazarlar_bot
bazarlar.online
```

### 4. Build приложения

```bash
npm run build
```

---

## Архитектура

```
frontend/
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── GoogleLoginButton.tsx        # Google OAuth
│   │       ├── TelegramLoginWidget.tsx      # Telegram виджет
│   │       └── TelegramCodeAuth.tsx         # Telegram код
│   ├── pages/
│   │   └── LoginPage.tsx                    # Страница входа
│   ├── services/
│   │   └── api.ts                           # API запросы
│   └── store/
│       └── slices/
│           └── authSlice.ts                 # Redux state
├── .env.example                             # Пример переменных
└── TELEGRAM_AUTH_SETUP.md                   # Эта документация
```

---

## Дополнительно

### Кастомизация виджета

Telegram Login Widget поддерживает кастомизацию:

```tsx
<TelegramLoginWidget
  botUsername="your_bot"
  buttonSize="medium"
  cornerRadius={10}
  usePic={false}
  lang="en"
/>
```

### Обработка ошибок

Все компоненты показывают пользователю понятные сообщения об ошибках:
- "Неверный формат телефона"
- "Код должен состоять из 6 цифр"
- "Код истек, запросите новый"

### Автозаполнение

TelegramCodeAuth:
- Автоматически форматирует телефон
- Ограничивает ввод кода 6 цифрами
- Фокусируется на поле ввода кода

---

## Поддержка

При возникновении проблем:
1. Проверьте backend logs
2. Проверьте Browser DevTools → Console
3. Проверьте Network tab для API запросов
4. Убедитесь, что backend запущен на правильном порту

## Лицензия

Bazarlar Online © 2024
