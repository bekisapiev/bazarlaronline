# Telegram Authentication - Полное руководство

## Обзор

Реализовано **4 способа** авторизации и регистрации через Telegram:

1. **Login Widget** - стандартный виджет для веб-сайтов (рекомендуется)
2. **WebApp** - авторизация через Telegram Mini App
3. **Код верификации** - отправка 6-значного кода в Telegram
4. **Webhook бот** - интерактивный бот с командами

---

## 1. Telegram Login Widget (рекомендуется для web)

### Описание
Стандартный виджет от Telegram для авторизации на веб-сайтах. Самый простой и безопасный способ.

### Frontend интеграция

#### HTML виджет
```html
<script async src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-login="YOUR_BOT_USERNAME"
        data-size="large"
        data-auth-url="https://bazarlar.online/auth/telegram-callback"
        data-request-access="write">
</script>
```

#### React компонент
```jsx
import { useEffect } from 'react';

function TelegramLoginButton({ onAuth }) {
  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      // user содержит: id, first_name, last_name, username, photo_url, auth_date, hash
      try {
        const response = await fetch('/api/v1/auth/telegram/widget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });

        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          onAuth(data);
        }
      } catch (error) {
        console.error('Auth failed:', error);
      }
    };
  }, []);

  return (
    <div>
      <script
        async
        src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-login="YOUR_BOT_USERNAME"
        data-size="large"
        data-onauth="onTelegramAuth(user)"
        data-request-access="write"
      />
    </div>
  );
}
```

### Backend endpoint
**POST** `/api/v1/auth/telegram/widget`

**Request:**
```json
{
  "id": "123456789",
  "first_name": "Айгуль",
  "last_name": "Асанова",
  "username": "aigul_a",
  "photo_url": "https://t.me/i/userpic/...",
  "auth_date": "1234567890",
  "hash": "abcdef123456..."
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Безопасность:**
- Backend проверяет подлинность данных через hash (HMAC-SHA256)
- Используется bot token как секретный ключ
- Невозможно подделать данные без знания bot token

---

## 2. Telegram WebApp

### Описание
Авторизация через Telegram Mini App - для приложений, работающих внутри Telegram.

### Frontend (Telegram WebApp)

```javascript
// В Telegram WebApp
const initData = window.Telegram.WebApp.initData;

fetch('/api/v1/auth/telegram/webapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ init_data: initData })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
});
```

### Backend endpoint
**POST** `/api/v1/auth/telegram/webapp`

**Request:**
```json
{
  "init_data": "query_id=AAH...&user=%7B%22id%22%3A123456789...&hash=abc123..."
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Безопасность:**
- Проверка initData через специальный алгоритм Telegram
- Используется HMAC-SHA256 с ключом "WebAppData"

---

## 3. Код верификации (SMS-like)

### Описание
Пользователь запрашивает код, бот отправляет 6-значный код в Telegram, пользователь вводит код.

### Frontend

#### Шаг 1: Запросить код
```javascript
async function requestCode(telegramId, phone) {
  const response = await fetch('/api/v1/auth/telegram/request-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_id: telegramId,
      phone: phone
    })
  });

  return await response.json();
  // { message: "Verification code sent to Telegram", expires_in_minutes: 10 }
}
```

#### Шаг 2: Проверить код
```javascript
async function verifyCode(telegramId, phone, code) {
  const response = await fetch('/api/v1/auth/telegram/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_id: telegramId,
      phone: phone,
      code: code,
      telegram_username: "username",  // optional
      full_name: "Айгуль Асанова"     // optional
    })
  });

  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
}
```

### Backend endpoints

**POST** `/api/v1/auth/telegram/request-code`
```json
{
  "telegram_id": "123456789",
  "phone": "+996555123456"
}
```

**POST** `/api/v1/auth/telegram/verify`
```json
{
  "telegram_id": "123456789",
  "phone": "+996555123456",
  "code": "123456",
  "telegram_username": "username",
  "full_name": "Айгуль Асанова"
}
```

---

## 4. Webhook бот с командами

### Описание
Интерактивный бот, который реагирует на команды пользователей.

### Доступные команды

#### /start
```
👋 Привет, Айгуль!

Добро пожаловать в Bazarlar Online - торговую площадку Кыргызстана!

🛍 Что я умею:
• Помогать с входом в систему
• Отправлять коды верификации
• Уведомлять о заказах и событиях

📱 Для входа на сайт:
Используйте кнопку "Login with Telegram" на сайте bazarlar.online
```

#### /help
Показывает справку по всем командам.

#### /login
Показывает инструкцию по входу и отображает Telegram ID пользователя.

### Настройка webhook

#### 1. Установить webhook URL
**POST** `/api/v1/telegram/set-webhook?webhook_url=https://bazarlar.online/api/v1/telegram/webhook`

```bash
curl -X POST "http://localhost:8000/api/v1/telegram/set-webhook?webhook_url=https://bazarlar.online/api/v1/telegram/webhook"
```

**Response:**
```json
{
  "ok": true,
  "message": "Webhook set to https://bazarlar.online/api/v1/telegram/webhook"
}
```

#### 2. Удалить webhook (для development)
**POST** `/api/v1/telegram/delete-webhook`

```bash
curl -X POST "http://localhost:8000/api/v1/telegram/delete-webhook"
```

### Обработка webhook
Telegram будет отправлять POST запросы на `/api/v1/telegram/webhook` с данными о сообщениях и командах.

---

## Настройка бота

### 1. Создать бота через BotFather

1. Откройте [@BotFather](https://t.me/botfather)
2. Отправьте `/newbot`
3. Укажите имя: `Bazarlar Online`
4. Укажите username: `bazarlar_online_bot` (должен заканчиваться на `_bot`)
5. Скопируйте токен

### 2. Настроить бота

```
/setdescription - Официальный бот торговой площадки Bazarlar Online
/setabouttext - Помогаем покупателям и продавцам в Кыргызстане
/setcommands:
start - Начать работу
help - Получить справку
login - Войти на сайт
```

### 3. Добавить токен в .env

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 4. Включить Login Widget

В BotFather:
```
/setdomain
@bazarlar_online_bot
bazarlar.online
```

---

## Архитектура безопасности

### Проверка данных от Login Widget

1. Получаем данные от виджета (id, first_name, username, auth_date, hash)
2. Удаляем `hash` из данных
3. Сортируем оставшиеся поля по ключу
4. Создаем data-check-string: `auth_date=123\nfirst_name=Name\nid=123`
5. Создаем secret_key = SHA256(bot_token)
6. Вычисляем HMAC-SHA256(data-check-string, secret_key)
7. Сравниваем с полученным hash

### Проверка данных от WebApp

1. Парсим initData (URL query parameters)
2. Удаляем `hash`
3. Сортируем оставшиеся параметры
4. Создаем data-check-string
5. Создаем secret_key = HMAC-SHA256("WebAppData", bot_token)
6. Вычисляем HMAC-SHA256(data-check-string, secret_key)
7. Сравниваем с полученным hash

---

## API Endpoints - Полный список

### Authentication

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/v1/auth/telegram/widget` | Login Widget авторизация |
| POST | `/api/v1/auth/telegram/webapp` | WebApp авторизация |
| POST | `/api/v1/auth/telegram/request-code` | Запрос кода верификации |
| POST | `/api/v1/auth/telegram/verify` | Проверка кода и вход |

### Bot Management

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/v1/telegram/webhook` | Webhook для бота (обработка команд) |
| POST | `/api/v1/telegram/set-webhook` | Установить webhook URL |
| POST | `/api/v1/telegram/delete-webhook` | Удалить webhook |

---

## Тестирование

### 1. Получить свой Telegram ID

Напишите боту [@userinfobot](https://t.me/userinfobot) - он вернет ваш ID.

### 2. Тестирование кодов верификации

```bash
# Запросить код
curl -X POST http://localhost:8000/api/v1/auth/telegram/request-code \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": "YOUR_TELEGRAM_ID",
    "phone": "+996555123456"
  }'

# Проверить код (код придет в Telegram)
curl -X POST http://localhost:8000/api/v1/auth/telegram/verify \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": "YOUR_TELEGRAM_ID",
    "phone": "+996555123456",
    "code": "123456"
  }'
```

### 3. Тестирование Login Widget

1. Создайте HTML файл с виджетом
2. Откройте в браузере через локальный сервер (не file://)
3. Нажмите кнопку авторизации
4. Проверьте, что данные отправляются на backend

### 4. Тестирование бота

```bash
# Установить webhook (для production с HTTPS)
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://bazarlar.online/api/v1/telegram/webhook"

# Для development - удалить webhook и использовать polling
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"

# Проверить команды
# Откройте бота в Telegram и отправьте:
# /start
# /help
# /login
```

---

## Рекомендации по использованию

### Для веб-сайта
✅ **Telegram Login Widget** - самый простой и надежный вариант

### Для Telegram Mini App
✅ **Telegram WebApp** - встроенная авторизация

### Для мобильного приложения
✅ **Код верификации** - универсальный способ

### Для уведомлений
✅ **Webhook бот** - отправка уведомлений о заказах, сообщениях и т.д.

---

## Безопасность

### ✅ Что реализовано

- Проверка подлинности всех данных от Telegram
- HMAC-SHA256 для всех методов авторизации
- JWT токены (access + refresh)
- Автоматическое создание кошелька для новых пользователей
- Проверка срока действия кодов верификации (10 минут)
- Уникальные constraint на telegram_id

### ⚠️ Важно

- НИКОГДА не храните bot_token в frontend коде
- Всегда используйте HTTPS для production
- Проверяйте auth_date чтобы предотвратить replay attacks
- Коды верификации действительны только 10 минут

---

## Примеры интеграции

### React + TypeScript

```typescript
interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

async function loginWithTelegram(user: TelegramUser): Promise<AuthTokens> {
  const response = await fetch('/api/v1/auth/telegram/widget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  return await response.json();
}
```

### Vue 3

```vue
<template>
  <div id="telegram-login"></div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.async = true;
  script.setAttribute('data-telegram-login', 'YOUR_BOT_USERNAME');
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');

  document.getElementById('telegram-login').appendChild(script);

  window.onTelegramAuth = async (user) => {
    const response = await fetch('/api/v1/auth/telegram/widget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await response.json();
    // Сохранить токены
    localStorage.setItem('access_token', data.access_token);
  };
});
</script>
```

---

## Troubleshooting

### Ошибка: "Invalid Telegram authentication data"

**Причина:** Hash не прошел валидацию
**Решение:**
- Проверьте, что TELEGRAM_BOT_TOKEN правильный в .env
- Убедитесь, что используется правильный bot username в виджете
- Проверьте, что данные не были изменены по пути

### Ошибка: "Failed to send verification code"

**Причина:** Бот не может отправить сообщение
**Решение:**
- Пользователь должен первым написать боту (отправить /start)
- Проверьте TELEGRAM_BOT_TOKEN
- Убедитесь, что telegram_id правильный

### Webhook не работает

**Причина:** Telegram не может достучаться до webhook URL
**Решение:**
- Webhook URL должен быть HTTPS (не HTTP)
- URL должен быть доступен из интернета (не localhost)
- Проверьте firewall и SSL сертификат

---

## Поддержка

При возникновении вопросов:
- Документация Telegram: https://core.telegram.org/bots/api
- Login Widget: https://core.telegram.org/widgets/login
- WebApp: https://core.telegram.org/bots/webapps

## Лицензия

Bazarlar Online © 2024
