# Инструкция по запуску Bazarlar Online на Windows 11

## Предварительные требования

### 1. Установите Python 3.11+
1. Скачайте Python с официального сайта: https://www.python.org/downloads/
2. При установке **обязательно отметьте "Add Python to PATH"**
3. Проверьте установку:
```bash
python --version
# Должно быть Python 3.11 или выше
```

### 2. Установите PostgreSQL 16+
1. Скачайте PostgreSQL: https://www.postgresql.org/download/windows/
2. Запустите установщик
3. При установке запомните пароль для пользователя `postgres`
4. Проверьте установку:
```bash
psql --version
# Должно быть PostgreSQL 16 или выше
```

### 3. Установите Redis (опционально для чата)
**Вариант А: Через WSL2 (рекомендуется)**
```bash
# Установите WSL2 если еще не установлен
wsl --install

# В WSL терминале:
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**Вариант Б: Через Memurai (порт Redis для Windows)**
1. Скачайте Memurai: https://www.memurai.com/
2. Установите и запустите

**Вариант В: Через Docker Desktop**
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 4. Установите Git (если еще не установлен)
1. Скачайте: https://git-scm.com/download/win
2. Установите с настройками по умолчанию

---

## Установка проекта

### Шаг 1: Клонируйте репозиторий (если еще не клонирован)
```bash
cd C:\Projects  # или любая другая папка
git clone <repository-url>
cd bazarlaronline
```

### Шаг 2: Создайте виртуальное окружение Python
```bash
# В корне проекта
cd backend
python -m venv venv
```

### Шаг 3: Активируйте виртуальное окружение
```bash
# В PowerShell
.\venv\Scripts\Activate.ps1

# В CMD
venv\Scripts\activate.bat

# Вы увидите (venv) перед командной строкой
```

**Примечание:** Если PowerShell выдает ошибку "execution policy", выполните:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Шаг 4: Установите зависимости
```bash
# Убедитесь что venv активировано (должно быть (venv) перед строкой)
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Настройка базы данных

### Шаг 1: Создайте базу данных PostgreSQL
```bash
# Откройте psql (в новом терминале, без venv)
psql -U postgres

# В psql консоли:
CREATE DATABASE bazarlar_claude;
CREATE USER bazarlar_user WITH PASSWORD 'bazarlar_pass';
GRANT ALL PRIVILEGES ON DATABASE bazarlar_claude TO bazarlar_user;

# Для PostgreSQL 15+, также выполните:
\c bazarlar_claude
GRANT ALL ON SCHEMA public TO bazarlar_user;

# Выход из psql:
\q
```

---

## Настройка окружения

### Шаг 1: Создайте файл .env
```bash
# В папке backend создайте файл .env
# Можно использовать блокнот или любой редактор
notepad .env
```

### Шаг 2: Скопируйте и настройте следующие переменные

```env
# Application
ENVIRONMENT=development
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql+asyncpg://bazarlar_user:bazarlar_pass@localhost:5432/bazarlar_claude

# Redis (если установлен)
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=365

# Google OAuth (оставьте пустым для начала)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Google Cloud Vision (опционально)
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=

# MBank Payment (опционально)
MBANK_MERCHANT_ID=
MBANK_API_KEY=
MBANK_API_URL=https://api.mbank.kg

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_IMAGE_TYPES=["image/jpeg", "image/png", "image/webp"]

# Pagination
DEFAULT_PAGE_SIZE=30
MAX_PAGE_SIZE=100

# Referral System
REFERRAL_CASHBACK_PERCENT=10
MIN_WITHDRAWAL_AMOUNT=3000

# Tariff Prices (KGS)
FREE_PROMOTION_PRICE=20
PRO_PROMOTION_PRICE=15
BUSINESS_PROMOTION_PRICE=10
PRO_MONTHLY_PRICE=500
BUSINESS_MONTHLY_PRICE=2000

# Partner Commission
PARTNER_COMMISSION_PERCENT=40
PLATFORM_COMMISSION_PERCENT=60

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

**Важно:** Измените `SECRET_KEY` на случайную строку!

Для генерации SECRET_KEY в Python:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Запуск проекта

### Шаг 1: Создайте таблицы в базе данных
```bash
# Убедитесь что venv активировано и вы в папке backend
cd C:\Projects\bazarlaronline\backend

# Создание таблиц произойдет автоматически при первом запуске
# Но можно проверить подключение к БД:
python -c "from app.database.session import engine; print('Database connection OK')"
```

### Шаг 2: Создайте папку для загрузок
```bash
mkdir uploads
```

### Шаг 3: Запустите сервер разработки
```bash
# Убедитесь что находитесь в папке backend и venv активировано
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Вы увидите:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
🚀 Starting Bazarlar Online...
✅ Application started successfully
INFO:     Application startup complete.
```

### Шаг 4: Откройте в браузере
- API документация (Swagger): http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- Health check: http://localhost:8000/health

---

## Создание первого админа

### Вариант 1: Через базу данных
```bash
# Откройте psql
psql -U postgres -d bazarlar_claude

# Создайте админа (замените email):
INSERT INTO users (id, email, full_name, role, tariff, created_at)
VALUES (gen_random_uuid(), 'admin@bazarlar.online', 'Admin User', 'admin', 'business', NOW());

\q
```

### Вариант 2: Через API (требуется Google OAuth)
1. Настройте Google OAuth в .env
2. Зарегистрируйтесь через /api/v1/auth/google
3. Измените роль в БД на 'admin'

---

## Тестирование API

### 1. Через Swagger UI
1. Откройте http://localhost:8000/api/docs
2. Все endpoints доступны с интерактивной документацией
3. Можно тестировать прямо в браузере

### 2. Через curl (PowerShell)
```powershell
# Health check
curl http://localhost:8000/health

# Получить список товаров
curl http://localhost:8000/api/v1/products/

# Получить категории
curl http://localhost:8000/api/v1/categories/
```

### 3. Через Postman
1. Установите Postman: https://www.postman.com/downloads/
2. Импортируйте OpenAPI схему: http://localhost:8000/api/v1/openapi.json

---

## Заполнение тестовыми данными

### Создайте города и рынки
```sql
-- Откройте psql
psql -U postgres -d bazarlar_claude

-- Города
INSERT INTO cities (id, name, slug) VALUES
(1, 'Бишкек', 'bishkek'),
(2, 'Ош', 'osh'),
(3, 'Джалал-Абад', 'jalal-abad');

-- Рынки в Бишкеке
INSERT INTO markets (id, city_id, name, address) VALUES
(1, 1, 'Дордой', 'ул. Шабдан Баатыра'),
(2, 1, 'Ошский рынок', 'ул. Киевская'),
(3, 1, 'Ортосайский рынок', 'ул. Ахунбаева');

-- Категории
INSERT INTO categories (id, name, slug, level, is_active, sort_order) VALUES
(1, 'Одежда', 'clothing', 1, true, 1),
(2, 'Электроника', 'electronics', 1, true, 2),
(3, 'Продукты', 'food', 1, true, 3);

\q
```

---

## Остановка сервера

1. В терминале где запущен сервер нажмите `CTRL+C`
2. Деактивируйте venv (опционально):
```bash
deactivate
```

---

## Запуск Frontend

Frontend разработан на **React 18** + **TypeScript** с использованием Material-UI.

### Предварительные требования

#### Установите Node.js 18+ и npm
1. Скачайте Node.js LTS: https://nodejs.org/
2. Запустите установщик (npm включен)
3. Проверьте установку:
```bash
node --version
# Должно быть v18 или выше

npm --version
# Должно быть 9 или выше
```

### Шаг 1: Перейдите в папку frontend
```bash
# Из корня проекта
cd frontend
```

### Шаг 2: Установите зависимости
```bash
npm install
```

Это установит все необходимые пакеты:
- React 18.3.1 + React Router
- Material-UI (MUI) для интерфейса
- Redux Toolkit для управления состоянием
- Axios для работы с API
- Socket.IO для чата
- TypeScript

**Примечание:** Первая установка может занять несколько минут.

### Шаг 3: Создайте файл .env (опционально)
```bash
# В папке frontend создайте файл .env
notepad .env
```

Добавьте переменные окружения:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

**Примечание:** Если файл .env не создан, frontend будет использовать значения по умолчанию (`http://localhost:8000`).

### Шаг 4: Запустите frontend в dev режиме
```bash
npm start
```

**Вы увидите:**
```
Compiled successfully!

You can now view bazarlar-online-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Frontend автоматически откроется в браузере на **http://localhost:3000**

### Шаг 5: Проверьте работу

После запуска frontend и backend вместе, вы сможете:

✅ **Главная страница** - http://localhost:3000/
- Список товаров
- Поиск
- Фильтры по категориям

✅ **Вход** - http://localhost:3000/login
- Аутентификация через Google (если настроен OAuth)

✅ **Каталог** - http://localhost:3000/products
- Просмотр товаров
- Фильтры и сортировка

✅ **Страница товара** - http://localhost:3000/products/:id
- Детальная информация
- Отзывы
- Чат с продавцом

✅ **Продавцы** - http://localhost:3000/sellers
- Каталог продавцов
- Фильтры по городам и рынкам

✅ **Профиль** - http://localhost:3000/profile
- Личные данные
- История заказов
- Кошелек

### Остановка frontend
В терминале где запущен frontend нажмите `CTRL+C`

---

## Запуск полного стека (Backend + Frontend)

Для полноценной работы платформы нужны оба сервера:

### Терминал 1: Backend
```bash
cd C:\Projects\bazarlaronline\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Терминал 2: Frontend
```bash
cd C:\Projects\bazarlaronline\frontend
npm start
```

**Результат:**
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/api/docs
- Frontend: http://localhost:3000

Frontend автоматически подключится к backend API.

---

## Полезные команды для Frontend

```bash
# Установить зависимости
npm install

# Запустить в dev режиме (с hot reload)
npm start

# Собрать для production
npm run build
# Результат в папке build/

# Запустить тесты
npm test

# Посмотреть установленные пакеты
npm list --depth=0

# Обновить зависимости
npm update

# Очистить кеш (если проблемы)
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Частые проблемы и решения

### Frontend проблемы

#### 1. Порт 3000 занят
**Проблема:** `Port 3000 is already in use`

**Решение:**
```bash
# Найти процесс на порту 3000
netstat -ano | findstr :3000

# Убить процесс
taskkill /PID <PID> /F

# Или используйте другой порт
set PORT=3001 && npm start
```

#### 2. CORS ошибки
**Проблема:** `Access to fetch blocked by CORS policy`

**Решение:**
- Проверьте что backend запущен на `http://localhost:8000`
- Убедитесь что в backend/.env добавлен frontend URL в CORS_ORIGINS:
```env
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

#### 3. API не отвечает
**Проблема:** `Network Error` или `ERR_CONNECTION_REFUSED`

**Решение:**
- Проверьте что backend запущен: http://localhost:8000/health
- Проверьте REACT_APP_API_URL в frontend/.env
- Проверьте что нет межсетевых экранов блокирующих localhost

#### 4. npm install выдает ошибки
**Проблема:** Ошибки при установке зависимостей

**Решение:**
```bash
# Очистите кеш и переустановите
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Или используйте --legacy-peer-deps
npm install --legacy-peer-deps
```

#### 5. Компиляция TypeScript ошибки
**Проблема:** TypeScript compilation errors

**Решение:**
- Проверьте версию TypeScript: `npm list typescript`
- Переустановите: `npm install typescript@latest`
- Проверьте tsconfig.json

### Backend проблемы

#### 1. Ошибка подключения к PostgreSQL
**Проблема:** `connection refused` или `password authentication failed`

**Решение:**
- Проверьте что PostgreSQL запущен (Services → postgresql-x64-16)
- Проверьте пароль в .env файле
- Проверьте что пользователь и БД созданы

### 2. Redis не подключается
**Проблема:** Чат не работает

**Решение:**
- Redis опционален, можно работать без него
- Проверьте что Redis запущен: `redis-cli ping` (должен ответить PONG)

### 3. Модуль не найден
**Проблема:** `ModuleNotFoundError: No module named 'fastapi'`

**Решение:**
- Убедитесь что venv активировано (должно быть (venv) перед строкой)
- Переустановите зависимости: `pip install -r requirements.txt`

### 4. Порт 8000 занят
**Проблема:** `Address already in use`

**Решение:**
```bash
# Найти процесс на порту 8000
netstat -ano | findstr :8000

# Убить процесс (замените PID)
taskkill /PID <PID> /F

# Или используйте другой порт
uvicorn app.main:app --reload --port 8001
```

### 5. Ошибки миграций/таблиц
**Проблема:** Таблицы не создаются

**Решение:**
```bash
# Пересоздайте БД
psql -U postgres

DROP DATABASE bazarlar_claude;
CREATE DATABASE bazarlar_claude;
GRANT ALL PRIVILEGES ON DATABASE bazarlar_claude TO bazarlar_user;
\c bazarlar_claude
GRANT ALL ON SCHEMA public TO bazarlar_user;
\q

# Перезапустите сервер
```

---

## Структура проекта

```
bazarlaronline/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Конфигурация, зависимости
│   │   ├── database/        # База данных
│   │   ├── models/          # SQLAlchemy модели
│   │   ├── schemas/         # Pydantic схемы
│   │   └── main.py          # Точка входа
│   ├── uploads/             # Загруженные файлы
│   ├── venv/                # Виртуальное окружение
│   ├── .env                 # Переменные окружения
│   ├── requirements.txt     # Зависимости
│   ├── test_data.sql        # Тестовые данные
│   └── README.md
├── frontend/                # React + TypeScript
│   ├── public/              # Статические файлы
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/           # Страницы
│   │   ├── store/           # Redux store
│   │   ├── services/        # API клиенты
│   │   ├── App.tsx          # Главный компонент
│   │   └── index.tsx        # Точка входа
│   ├── package.json         # Зависимости npm
│   └── tsconfig.json        # TypeScript конфиг
├── SETUP_WINDOWS.md         # Инструкция для Windows
└── README.md
```

---

## Полезные команды

```bash
# Активировать venv
.\venv\Scripts\Activate.ps1

# Запустить сервер
uvicorn app.main:app --reload

# Запустить на другом порту
uvicorn app.main:app --reload --port 8001

# Посмотреть логи в реальном времени
# (логи выводятся в консоль)

# Обновить зависимости
pip install --upgrade -r requirements.txt

# Посмотреть установленные пакеты
pip list

# Создать requirements.txt (если нужно)
pip freeze > requirements.txt
```

---

## Следующие шаги

1. ✅ Backend запущен на http://localhost:8000
2. ✅ Frontend запущен на http://localhost:3000
3. 📝 Изучите API документацию: http://localhost:8000/api/docs
4. 🔑 Настройте Google OAuth для полной аутентификации
5. 📊 Заполните базу тестовыми данными из test_data.sql
6. 🎨 Кастомизируйте дизайн под ваши нужды
7. 🚀 Настройте деплой на production сервер

---

## Поддержка

Если возникли проблемы:

**Backend:**
1. Проверьте что PostgreSQL запущен
2. Проверьте .env файл в папке backend
3. Убедитесь что venv активировано
4. Посмотрите логи в консоли

**Frontend:**
1. Проверьте что Node.js установлен
2. Проверьте что backend запущен
3. Очистите кеш npm если возникают ошибки
4. Проверьте консоль браузера для ошибок

**Платформа готова к работе! 🎉**

- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/api/docs
- Frontend: http://localhost:3000
