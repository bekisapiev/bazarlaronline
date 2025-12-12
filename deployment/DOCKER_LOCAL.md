# Локальный запуск через Docker

Полное руководство по запуску Bazarlar Online на локальной машине через Docker.

## Требования

- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **RAM:** минимум 4 GB
- **Диск:** минимум 10 GB свободного места
- **OS:** Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

## Установка Docker

### Windows
1. Скачайте [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Установите и запустите Docker Desktop
3. Убедитесь что WSL 2 включен

### macOS
1. Скачайте [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. Установите и запустите Docker Desktop

### Linux (Ubuntu/Debian)
```bash
# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# Проверьте установку
docker --version
docker compose version
```

## Шаг 1: Клонирование проекта

```bash
# Клонируйте репозиторий
git clone https://github.com/your-org/bazarlaronline.git
cd bazarlaronline
```

## Шаг 2: Настройка переменных окружения

### Backend (.env в корне проекта)

```bash
# Скопируйте файл примера
cp .env.example .env

# Отредактируйте .env файл
nano .env  # или используйте любой текстовый редактор
```

**Минимальная конфигурация для локального запуска:**

```env
# Database
DATABASE_URL=postgresql+asyncpg://bazarlar_user:bazarlar_pass@postgres:5432/bazarlar_claude
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bazarlar_claude
DB_USER=bazarlar_user
DB_PASSWORD=bazarlar_pass

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=525600
REFRESH_TOKEN_EXPIRE_DAYS=365

# Google OAuth (опционально для локальной разработки)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Application
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/app/uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

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
```

### Frontend (.env в директории frontend/)

```bash
# Скопируйте файл примера
cp frontend/.env.example frontend/.env

# Отредактируйте frontend/.env файл
nano frontend/.env
```

**Конфигурация frontend:**

```env
REACT_APP_API_URL=http://localhost:8000

# Google OAuth (опционально)
REACT_APP_GOOGLE_CLIENT_ID=
```

## Шаг 3: Запуск через Docker Compose

```bash
# Запустите все сервисы
docker-compose up -d

# Проверьте статус контейнеров
docker-compose ps
```

**Ожидаемый вывод:**
```
NAME                    SERVICE     STATUS      PORTS
bazarlar_api           api         running     0.0.0.0:8000->8000/tcp
bazarlar_frontend      frontend    running     0.0.0.0:3000->3000/tcp
bazarlar_postgres      postgres    running     5432/tcp
bazarlar_redis         redis       running     6379/tcp
```

## Шаг 4: Инициализация базы данных

```bash
# Создайте схему базы данных
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql

# Загрузите тестовые данные (опционально)
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/test_data.sql
```

## Шаг 5: Проверка работы

### API
Откройте в браузере: http://localhost:8000/docs

Вы должны увидеть интерактивную документацию API (Swagger UI).

### Frontend
Откройте в браузере: http://localhost:3000

Вы должны увидеть главную страницу Bazarlar Online.

### Тестовый вход
Если загрузили тестовые данные:
- **Email:** `buyer1@example.com`
- **Пароль:** `password123`

## Управление контейнерами

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только API
docker-compose logs -f api

# Только Frontend
docker-compose logs -f frontend

# Только PostgreSQL
docker-compose logs -f postgres
```

### Остановка

```bash
# Остановить все контейнеры
docker-compose stop

# Остановить и удалить контейнеры
docker-compose down

# Остановить и удалить с очисткой томов (УДАЛИТ ДАННЫЕ!)
docker-compose down -v
```

### Перезапуск

```bash
# Перезапустить все сервисы
docker-compose restart

# Перезапустить только API
docker-compose restart api
```

### Rebuild после изменений кода

```bash
# Пересобрать и перезапустить
docker-compose up -d --build

# Пересобрать только API
docker-compose up -d --build api

# Пересобрать только Frontend
docker-compose up -d --build frontend
```

## Доступ к контейнерам

### Выполнение команд в контейнерах

```bash
# PostgreSQL консоль
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# API контейнер (Python shell)
docker exec -it bazarlar_api python

# Redis консоль
docker exec -it bazarlar_redis redis-cli

# Bash в API контейнере
docker exec -it bazarlar_api bash

# Bash в Frontend контейнере
docker exec -it bazarlar_frontend sh
```

## Решение проблем

### Порты уже используются

Если порты 3000, 8000, 5432 или 6379 уже заняты:

**Вариант 1:** Остановите программы, использующие эти порты

**Вариант 2:** Измените порты в `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Изменили 3000 на 3001

  api:
    ports:
      - "8001:8000"  # Изменили 8000 на 8001
```

Не забудьте обновить `REACT_APP_API_URL` в `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8001
```

### База данных не инициализировалась

```bash
# Остановите контейнеры
docker-compose down -v

# Удалите volumes
docker volume rm bazarlar_postgres_data

# Запустите снова
docker-compose up -d

# Подождите 10 секунд и инициализируйте БД
sleep 10
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql
```

### API не запускается

```bash
# Проверьте логи
docker-compose logs api

# Проверьте .env файл
cat .env

# Убедитесь что DATABASE_URL правильный
# Для Docker должно быть: postgresql+asyncpg://bazarlar_user:bazarlar_pass@postgres:5432/bazarlar_claude
```

### Frontend показывает ошибки подключения

```bash
# Проверьте frontend/.env
cat frontend/.env

# REACT_APP_API_URL должен быть http://localhost:8000

# Проверьте что API работает
curl http://localhost:8000/docs
```

### Нехватка памяти

Если Docker жалуется на нехватку памяти:

**Windows/Mac:** Docker Desktop → Settings → Resources → увеличьте Memory до 4-6 GB

**Linux:** Docker использует всю доступную память системы

### Очистка Docker

Если нужно освободить место:

```bash
# Удалить все остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# ВНИМАНИЕ: Удалить ВСЁ неиспользуемое (контейнеры, образы, volumes, networks)
docker system prune -a --volumes
```

## Разработка

### Hot Reload

Frontend и Backend настроены на автоматическую перезагрузку при изменении кода:

- **Frontend:** React dev server с hot reload
- **Backend:** Uvicorn с `--reload` флагом

Просто редактируйте файлы - изменения применятся автоматически!

### Установка зависимостей

#### Backend (Python)

```bash
# Зайдите в контейнер
docker exec -it bazarlar_api bash

# Установите пакет
pip install package-name

# Обновите requirements.txt
pip freeze > requirements.txt

# Выйдите из контейнера
exit

# Пересоберите образ
docker-compose up -d --build api
```

#### Frontend (Node.js)

```bash
# Зайдите в контейнер
docker exec -it bazarlar_frontend sh

# Установите пакет
npm install package-name

# Выйдите из контейнера
exit

# Пересоберите образ
docker-compose up -d --build frontend
```

## Производительность

Для ускорения работы на Windows/Mac:

1. Используйте WSL 2 (Windows) или новую файловую систему (Mac)
2. Не размещайте проект на монтированных Windows дисках
3. Увеличьте выделенную память в Docker Desktop

## Следующие шаги

- ✅ Локальное окружение запущено
- 📖 Изучите API: http://localhost:8000/docs
- 🎨 Начните разработку frontend: http://localhost:3000
- 🚀 Готовы к production? См. [BEGET_DEPLOYMENT.md](./BEGET_DEPLOYMENT.md)
