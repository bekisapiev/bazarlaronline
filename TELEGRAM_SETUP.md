# Настройка Telegram авторизации и исправление Google OAuth

## Telegram Bot Setup

### 1. Создать Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям: введите имя бота и username
4. BotFather выдаст вам **токен бота** - сохраните его

### 2. Настроить бота

Отправьте команды BotFather:
```
/setdescription - Установить описание бота
/setabouttext - Установить текст "О боте"
/setuserpic - Установить аватар бота
```

### 3. Добавить токен в .env

Откройте файл `.env` в корне проекта и добавьте:
```env
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
```

### 4. Запустить миграцию

Выполните миграцию для добавления Telegram полей в базу данных:

```bash
# Через psql
PGPASSWORD=123456 psql -h localhost -p 5433 -U postgres -d bazarlar_claude -f backend/migrations/004_add_telegram_auth.sql

# Или через Python (если установлен psycopg2)
cd backend/migrations
python3 run_migrations.py --test-data-only 004_add_telegram_auth.sql
```

### 5. Перезапустить приложение

После добавления токена перезапустите backend:
```bash
cd backend
uvicorn app.main:app --reload
```

---

## API эндпоинты Telegram авторизации

### POST `/api/v1/auth/telegram/request-code`

Запрос кода верификации

**Request:**
```json
{
  "telegram_id": "123456789",
  "phone": "+996555123456"
}
```

**Response:**
```json
{
  "message": "Verification code sent to Telegram",
  "expires_in_minutes": 10
}
```

### POST `/api/v1/auth/telegram/verify`

Проверка кода и авторизация/регистрация

**Request:**
```json
{
  "telegram_id": "123456789",
  "phone": "+996555123456",
  "code": "123456",
  "telegram_username": "username",
  "full_name": "Айгуль Асанова"
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

---

## Как работает Telegram авторизация

1. **Пользователь запрашивает код:** Frontend отправляет `telegram_id` и `phone` на `/telegram/request-code`
2. **Бот отправляет код:** Backend генерирует 6-значный код и отправляет его пользователю в Telegram
3. **Код сохраняется в БД:** Код и время истечения (10 минут) сохраняются в таблице `users`
4. **Пользователь вводит код:** Frontend отправляет код на `/telegram/verify`
5. **Проверка и авторизация:** Backend проверяет код, создает пользователя (если новый) и возвращает JWT токены

---

## Исправление Google OAuth

### Проблема

```
Access to XMLHttpRequest at 'https://accounts.google.com/o/oauth2/...' from origin
'http://localhost:3000' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000'
that is not equal to the supplied origin.

idpiframe_initialization_failed
Not a valid origin for the client: http://localhost:3000 has not been registered for client ID
```

### Решение

Нужно добавить `http://localhost:3000` в **разрешенные источники** в Google Cloud Console:

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите ваш **OAuth 2.0 Client ID** и нажмите на него
5. В разделе **Authorized JavaScript origins** добавьте:
   ```
   http://localhost:3000
   http://localhost:8000
   ```
6. В разделе **Authorized redirect URIs** добавьте:
   ```
   http://localhost:3000/auth/callback
   ```
7. Нажмите **Save**

### Для production

Когда развернете на реальном домене, добавьте также:
```
https://bazarlar.online
https://www.bazarlar.online
```

---

## Тестирование

### Проверка Telegram бота

1. Найдите вашего бота в Telegram
2. Отправьте ему `/start`
3. Отправьте тестовый запрос на `/telegram/request-code` через Postman или curl
4. Проверьте, что код пришел в Telegram

### Curl примеры

```bash
# Request code
curl -X POST http://localhost:8000/api/v1/auth/telegram/request-code \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": "YOUR_TELEGRAM_ID",
    "phone": "+996555123456"
  }'

# Verify code
curl -X POST http://localhost:8000/api/v1/auth/telegram/verify \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": "YOUR_TELEGRAM_ID",
    "phone": "+996555123456",
    "code": "123456"
  }'
```

### Получить свой Telegram ID

1. Найдите бота [@userinfobot](https://t.me/userinfobot)
2. Отправьте ему любое сообщение
3. Бот вернет ваш `Id` - это и есть ваш `telegram_id`

---

## Что было добавлено в код

### База данных (004_add_telegram_auth.sql)
- `telegram_id` - Telegram ID пользователя (уникальный индекс)
- `telegram_username` - Username в Telegram
- `phone_verification_code` - Код верификации
- `phone_verification_expires_at` - Время истечения кода

### Backend файлы
- `backend/app/services/telegram_bot.py` - Сервис для работы с Telegram Bot API
- `backend/app/schemas/auth.py` - Добавлены схемы `TelegramAuthRequest`, `TelegramVerifyRequest`
- `backend/app/api/v1/endpoints/auth.py` - Добавлены эндпоинты `/telegram/request-code`, `/telegram/verify`
- `backend/app/core/config.py` - Добавлен `TELEGRAM_BOT_TOKEN`
- `backend/app/models/user.py` - Добавлены Telegram поля

---

## FAQ

**Q: Как узнать, работает ли бот?**
A: Отправьте GET запрос: `https://api.telegram.org/bot<YOUR_TOKEN>/getMe`

**Q: Бот не отправляет сообщения**
A: Убедитесь, что:
1. Токен правильный в .env
2. Пользователь первым написал боту (отправил /start)
3. telegram_id правильный

**Q: Где взять GOOGLE_CLIENT_ID?**
A: В [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

**Q: Нужно ли обновлять frontend?**
A: Да, нужно добавить UI для Telegram авторизации. Это отдельная задача.
