# Деплой Bazarlar Online через Docker

Полное руководство по развертыванию приложения Bazarlar Online на production сервере с использованием Docker и Docker Compose.

## Преимущества Docker

✅ **Изолированная среда** - все зависимости в контейнерах
✅ **Простота развертывания** - одна команда для запуска
✅ **Легкость обновления** - простой откат изменений
✅ **Масштабируемость** - легко добавить workers
✅ **Консистентность** - одинаково работает везде

---

## Требования

### Минимальные системные требования:
- **RAM:** 2 GB (рекомендуется 4 GB)
- **CPU:** 2 ядра
- **Диск:** 20 GB SSD
- **OS:** Ubuntu 20.04+ / Debian 11+

### Необходимое ПО:
- Docker 20.10+
- Docker Compose 2.0+
- Git

---

## Шаг 1: Установка Docker на сервере

### Подключитесь к серверу по SSH

```bash
ssh bazarlar@46.173.18.202
```

### Установите Docker

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите необходимые пакеты
sudo apt install -y ca-certificates curl gnupg lsb-release

# Добавьте GPG ключ Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Добавьте репозиторий Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Обновите список пакетов
sudo apt update

# Установите Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверьте установку
docker --version
docker compose version
```

### Добавьте пользователя в группу Docker

```bash
# Добавьте текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Выйдите и войдите снова для применения изменений
exit
ssh bazarlar@46.173.18.202

# Проверьте, что Docker работает без sudo
docker ps
```

---

## Шаг 2: Клонирование проекта на сервер

```bash
# Перейдите в рабочую директорию
cd /var/www

# Клонируйте репозиторий
sudo git clone https://github.com/ваш_пользователь/bazarlaronline.git

# Измените владельца директории
sudo chown -R $USER:$USER bazarlaronline

# Перейдите в директорию проекта
cd bazarlaronline
```

---

## Шаг 3: Настройка переменных окружения

### Создайте файл .env для backend

```bash
# Скопируйте шаблон
cp backend/.env.example backend/.env

# Отредактируйте файл
nano backend/.env
```

### Минимальная конфигурация .env:

```env
# Database (Docker будет использовать контейнер postgres)
DATABASE_URL=postgresql+asyncpg://bazarlar_user:Bazarlar-Online-10816@postgres:5432/bazarlar_prod
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bazarlar_prod
DB_USER=bazarlar_user
DB_PASSWORD=Bazarlar-Online-10816

# Redis (Docker будет использовать контейнер redis)
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379

# JWT & Security (ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ!)
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=365

# Application
API_URL=http://46.173.18.202/api
FRONTEND_URL=http://46.173.18.202
ENVIRONMENT=production

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/app/uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Остальные настройки (заполните своими данными)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MBANK_MERCHANT_ID=your-merchant-id
MBANK_API_KEY=your-api-key
```

### Сгенерируйте SECRET_KEY:

```bash
# Сгенерируйте случайный SECRET_KEY
openssl rand -hex 32

# Скопируйте результат и вставьте в .env файл
```

---

## Шаг 4: Подготовка frontend

### Вариант A: Собрать на локальной машине (рекомендуется)

На вашем Windows компьютере:

```powershell
# Перейдите в директорию frontend
cd C:\путь\к\проекту\bazarlaronline\frontend

# Создайте production .env
echo "REACT_APP_API_URL=http://46.173.18.202/api" > .env.production

# Установите зависимости и соберите
npm install
npm run build

# Заархивируйте build директорию
Compress-Archive -Path build -DestinationPath build.zip
```

Затем загрузите `build.zip` на сервер через FileZilla/WinSCP в `/var/www/bazarlaronline/frontend/`

На сервере распакуйте:

```bash
cd /var/www/bazarlaronline/frontend
unzip build.zip
```

### Вариант B: Собрать на сервере (если есть 2+ GB RAM)

```bash
cd /var/www/bazarlaronline/frontend

# Создайте .env для production
echo "REACT_APP_API_URL=http://46.173.18.202/api" > .env.production

# Создайте swap если недостаточно RAM
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Соберите frontend
export NODE_OPTIONS="--max_old_space_size=2048"
export GENERATE_SOURCEMAP=false
npm install
npm run build

# Отключите swap после сборки (опционально)
sudo swapoff /swapfile
```

---

## Шаг 5: Запуск приложения через Docker

### Остановите все запущенные сервисы (если есть)

```bash
# Остановите systemd сервисы если они запущены
sudo systemctl stop bazarlar-api bazarlar-celery nginx 2>/dev/null || true

# Закройте порт 8000 если он открыт
sudo ufw delete allow 8000/tcp 2>/dev/null || true
```

### Запустите Docker Compose

```bash
cd /var/www/bazarlaronline

# Соберите и запустите все сервисы
docker compose -f docker-compose.prod.yml up -d --build

# Проверьте статус контейнеров
docker compose -f docker-compose.prod.yml ps
```

Вы должны увидеть 5 запущенных контейнеров:
- `bazarlar_postgres` - База данных PostgreSQL 18
- `bazarlar_redis` - Redis кэш
- `bazarlar_backend` - FastAPI приложение
- `bazarlar_celery` - Celery worker
- `bazarlar_nginx` - Nginx веб-сервер

### Просмотр логов

```bash
# Все логи
docker compose -f docker-compose.prod.yml logs -f

# Только backend
docker compose -f docker-compose.prod.yml logs -f backend

# Только nginx
docker compose -f docker-compose.prod.yml logs -f nginx
```

---

## Шаг 6: Применение миграций базы данных

### Импортируйте существующую базу данных (если есть)

```bash
# Скопируйте dump файл на сервер (через scp или FileZilla)
# Например: /tmp/database_dump.sql

# Импортируйте данные в PostgreSQL контейнер
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod < /tmp/database_dump.sql
```

### Или примените SQL миграции

```bash
# Выполните миграции по одной
for migration in /var/www/bazarlaronline/backend/migrations/*.sql; do
    echo "Applying $migration..."
    docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod < "$migration"
done
```

---

## Шаг 7: Настройка firewall

```bash
# Откройте необходимые порты
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включите firewall
sudo ufw --force enable

# Проверьте статус
sudo ufw status
```

**Важно:** Порт 8000 НЕ должен быть открыт! Все запросы идут через Nginx на порт 80.

---

## Шаг 8: Проверка работы приложения

Откройте в браузере:

- **Frontend:** http://46.173.18.202/
- **API Docs:** http://46.173.18.202/api/v1/docs
- **Health Check:** http://46.173.18.202/api/v1/health

---

## Управление Docker контейнерами

### Основные команды

```bash
# Просмотр запущенных контейнеров
docker compose -f docker-compose.prod.yml ps

# Просмотр логов
docker compose -f docker-compose.prod.yml logs -f

# Остановить все контейнеры
docker compose -f docker-compose.prod.yml down

# Запустить контейнеры
docker compose -f docker-compose.prod.yml up -d

# Перезапустить конкретный сервис
docker compose -f docker-compose.prod.yml restart backend

# Пересобрать и перезапустить после изменений
docker compose -f docker-compose.prod.yml up -d --build

# Зайти в контейнер
docker exec -it bazarlar_backend bash
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod
```

### Просмотр ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Размер контейнеров и образов
docker system df

# Очистка неиспользуемых образов
docker system prune -a
```

---

## Обновление приложения

После внесения изменений в код:

```bash
cd /var/www/bazarlaronline

# Получите последние изменения
git pull origin main

# Пересоберите и перезапустите контейнеры
docker compose -f docker-compose.prod.yml up -d --build

# Проверьте логи
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Резервное копирование

### Backup базы данных

```bash
# Создайте директорию для backups
mkdir -p /var/backups/bazarlaronline

# Создайте backup
docker exec bazarlar_postgres pg_dump -U bazarlar_user bazarlar_prod > \
  /var/backups/bazarlaronline/db_backup_$(date +%Y%m%d_%H%M%S).sql

# Автоматический backup через cron (каждый день в 2:00 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * docker exec bazarlar_postgres pg_dump -U bazarlar_user bazarlar_prod > /var/backups/bazarlaronline/db_backup_\$(date +\\%Y\\%m\\%d_\\%H\\%M\\%S).sql") | crontab -
```

### Backup загруженных файлов

```bash
# Создайте backup uploads volume
docker run --rm \
  -v bazarlaronline_uploads:/uploads \
  -v /var/backups/bazarlaronline:/backup \
  alpine tar czf /backup/uploads_backup_$(date +%Y%m%d).tar.gz -C /uploads .
```

### Восстановление из backup

```bash
# Восстановить базу данных
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod < \
  /var/backups/bazarlaronline/db_backup_XXXXXX.sql

# Восстановить uploads
docker run --rm \
  -v bazarlaronline_uploads:/uploads \
  -v /var/backups/bazarlaronline:/backup \
  alpine tar xzf /backup/uploads_backup_XXXXXX.tar.gz -C /uploads
```

---

## Мониторинг и логи

### Просмотр логов в реальном времени

```bash
# Все сервисы
docker compose -f docker-compose.prod.yml logs -f

# Только backend
docker compose -f docker-compose.prod.yml logs -f backend

# Только Celery
docker compose -f docker-compose.prod.yml logs -f celery

# Последние 100 строк
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Проверка здоровья сервисов

```bash
# Статус всех контейнеров
docker compose -f docker-compose.prod.yml ps

# Проверка health check
docker inspect --format='{{json .State.Health}}' bazarlar_backend | jq

# Использование ресурсов
docker stats --no-stream
```

---

## Решение проблем

### Контейнер не запускается

```bash
# Проверьте логи
docker compose -f docker-compose.prod.yml logs backend

# Проверьте статус
docker compose -f docker-compose.prod.yml ps

# Пересоздайте контейнер
docker compose -f docker-compose.prod.yml up -d --force-recreate backend
```

### База данных недоступна

```bash
# Проверьте, запущен ли PostgreSQL
docker compose -f docker-compose.prod.yml ps postgres

# Проверьте логи PostgreSQL
docker compose -f docker-compose.prod.yml logs postgres

# Подключитесь к базе вручную
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod
```

### Nginx выдает 502 Bad Gateway

```bash
# Проверьте, что backend запущен
docker compose -f docker-compose.prod.yml ps backend

# Проверьте логи backend
docker compose -f docker-compose.prod.yml logs backend

# Проверьте логи nginx
docker compose -f docker-compose.prod.yml logs nginx

# Перезапустите nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Нехватка памяти

```bash
# Проверьте использование памяти
docker stats

# Уменьшите количество workers в docker-compose.prod.yml
# Измените --workers 4 на --workers 2

# Перезапустите с новыми настройками
docker compose -f docker-compose.prod.yml up -d --build
```

### Очистка дискового пространства

```bash
# Удалите неиспользуемые образы
docker image prune -a

# Удалите неиспользуемые volumes
docker volume prune

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a --volumes
```

---

## Настройка SSL (HTTPS)

### С использованием Certbot

```bash
# Установите Certbot
sudo apt install certbot -y

# Остановите nginx контейнер
docker compose -f docker-compose.prod.yml stop nginx

# Получите сертификат
sudo certbot certonly --standalone -d ваш_домен.com -d www.ваш_домен.com

# Скопируйте сертификаты в проект
sudo mkdir -p /var/www/bazarlaronline/deployment/ssl
sudo cp /etc/letsencrypt/live/ваш_домен.com/fullchain.pem /var/www/bazarlaronline/deployment/ssl/
sudo cp /etc/letsencrypt/live/ваш_домен.com/privkey.pem /var/www/bazarlaronline/deployment/ssl/

# Обновите nginx.docker.conf для поддержки SSL
# (добавьте server block для 443 порта)

# Перезапустите nginx
docker compose -f docker-compose.prod.yml up -d nginx
```

---

## Production Checklist

Перед запуском в production проверьте:

- [ ] SECRET_KEY изменен на случайное значение
- [ ] Все пароли базы данных изменены
- [ ] .env файл содержит production значения
- [ ] Frontend собран в production режиме
- [ ] Firewall настроен (только 80, 443, 22)
- [ ] SSL сертификат установлен (для HTTPS)
- [ ] Резервное копирование настроено
- [ ] Логирование настроено
- [ ] Мониторинг настроен
- [ ] Google OAuth credentials для production домена
- [ ] MBank credentials настроены

---

## Полезные ссылки

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

---

**Поздравляем! Ваше приложение Bazarlar Online успешно развернуто через Docker! 🎉**

Сайт доступен по адресу: http://46.173.18.202
