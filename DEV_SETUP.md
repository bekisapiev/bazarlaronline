# Инструкция по локальной разработке

Этот гайд покажет, как запустить только базы данных в Docker, а backend и frontend локально в отдельных терминалах.

## Преимущества такого подхода:
- Быстрый hot-reload для backend и frontend
- Легче отлаживать код
- Не нужно пересобирать Docker контейнеры при каждом изменении
- Доступ к консоли Python/Node.js напрямую

## Шаг 1: Запустить базы данных в Docker

```bash
# Запустить только PostgreSQL и Redis
docker-compose -f docker-compose.dev.yml up -d

# Проверить, что контейнеры запущены
docker-compose -f docker-compose.dev.yml ps

# Посмотреть логи (если нужно)
docker-compose -f docker-compose.dev.yml logs -f
```

## Шаг 2: Настроить backend

### 2.1 Установить зависимости Python

```bash
cd backend

# Создать виртуальное окружение (если еще не создано)
python3 -m venv venv

# Активировать виртуальное окружение
# Для Linux/macOS:
source venv/bin/activate
# Для Windows:
# venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt
```

### 2.2 Скопировать .env файл

```bash
# Вернуться в корневую директорию
cd ..

# Использовать .env.local для локальной разработки
cp .env.local .env

# ИЛИ создать symlink
# ln -s .env.local .env
```

**Важно:** Файл `.env.local` уже настроен с `localhost` вместо имен Docker сервисов.

### 2.3 Запустить backend

```bash
cd backend

# Запустить с hot-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# ИЛИ через Python
# python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен на: http://localhost:8000

API документация: http://localhost:8000/api/docs

## Шаг 3: Настроить frontend

### 3.1 Установить зависимости Node.js

Откройте **новый терминал**:

```bash
cd frontend

# Установить зависимости (если еще не установлены)
npm install
```

### 3.2 Создать .env для frontend

**Для Linux/macOS:**
```bash
# В папке frontend создайте файл .env
cd frontend
cp .env.example .env
```

**Для Windows (PowerShell):**
```powershell
# В папке frontend создайте файл .env
cd frontend
Copy-Item .env.example .env
```

**ИЛИ создайте файл вручную:**
Создайте файл `.env` в папке `frontend` со следующим содержимым:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:8000
```

**ВАЖНО:** После создания .env файла обязательно перезапустите dev-сервер (npm start), если он уже был запущен!

### 3.3 Запустить frontend

```bash
# В папке frontend
npm start
```

Frontend будет доступен на: http://localhost:3000

## Шаг 4: Загрузить начальные данные в базу

**ВАЖНО:** Если вы впервые запускаете проект, база данных будет пустой!

Чтобы заполнить базу данных городами, рынками и категориями:

```bash
cd backend

# Убедитесь, что venv активирован
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate    # Windows

# Запустите seed скрипт
python seed.py
```

Скрипт добавит:
- 9 городов Кыргызстана (Бишкек, Ош, Джалал-Абад и др.)
- 10 рынков
- 28 категорий товаров и услуг

### Шаг 4.1: (Опционально) Загрузить тестовые товары и продавцов

Для полноценного тестирования рекомендуется также загрузить тестовые данные:

```bash
# В папке backend (venv активирован)
python seed_sellers_products.py
```

Этот скрипт добавит:
- 10 тестовых продавцов (магазины на рынках, бутики, офисы)
- 25 товаров (электроника, одежда, мебель, продукты)
- 10 услуг (ремонт, красота, доставка, образование)

**Подробная инструкция:** См. [DATABASE_SETUP.md](DATABASE_SETUP.md)

## Шаг 5: (Опционально) Celery для фоновых задач

Если нужны фоновые задачи (Celery), откройте **еще один терминал**:

```bash
cd backend

# Активировать venv
source venv/bin/activate

# Запустить Celery worker
celery -A app.celery_app worker --loglevel=info

# В отдельном терминале можно запустить Celery Beat для периодических задач:
# celery -A app.celery_app beat --loglevel=info
```

## Полезные команды

### Управление базами данных

```bash
# Остановить базы данных
docker-compose -f docker-compose.dev.yml stop

# Запустить снова
docker-compose -f docker-compose.dev.yml start

# Удалить контейнеры (данные сохранятся в volumes)
docker-compose -f docker-compose.dev.yml down

# Удалить контейнеры и данные
docker-compose -f docker-compose.dev.yml down -v

# Подключиться к PostgreSQL
docker exec -it bazarlar_postgres_dev psql -U bazarlar_user -d bazarlar_claude

# Подключиться к Redis CLI
docker exec -it bazarlar_redis_dev redis-cli
```

### Проверка подключений

```bash
# Проверить подключение к PostgreSQL
psql -h localhost -U bazarlar_user -d bazarlar_claude

# Проверить подключение к Redis
redis-cli ping
```

## Структура запущенных сервисов

После запуска у вас будут работать:

| Сервис | Адрес | Описание |
|--------|-------|----------|
| PostgreSQL | localhost:5432 | База данных |
| Redis | localhost:6379 | Кэш и очереди |
| Backend API | http://localhost:8000 | FastAPI приложение |
| Frontend | http://localhost:3000 | React приложение |
| API Docs | http://localhost:8000/api/docs | Swagger UI |

## Troubleshooting

### Frontend показывает "Товары не найдены" или "Not Found"
**Причина:** База данных пустая, нет городов/рынков/категорий.

**Решение:** Загрузите начальные данные:
```bash
cd backend
source venv/bin/activate  # или venv\Scripts\activate для Windows
python seed.py
```

**Подробнее:** См. [DATABASE_SETUP.md](DATABASE_SETUP.md)

### Порт 5432 уже занят
Если у вас локально установлен PostgreSQL:
```bash
# Остановить локальный PostgreSQL
sudo systemctl stop postgresql
# или
brew services stop postgresql
```

### Порт 6379 уже занят
Если у вас локально установлен Redis:
```bash
# Остановить локальный Redis
sudo systemctl stop redis
# или
brew services stop redis
```

### Backend не может подключиться к базе
Проверьте, что:
1. Docker контейнеры запущены: `docker ps`
2. В `.env` используется `localhost`, а не `postgres`
3. Порты 5432 и 6379 доступны

### Hot-reload не работает на frontend
```bash
# Для Linux может понадобиться увеличить лимит файловых дескрипторов
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Возврат к полному Docker окружению

Если захотите вернуться к полному Docker окружению:

```bash
# Остановить локальные процессы (Ctrl+C в каждом терминале)

# Остановить dev базы данных
docker-compose -f docker-compose.dev.yml down

# Запустить полное окружение
docker-compose up -d
```
