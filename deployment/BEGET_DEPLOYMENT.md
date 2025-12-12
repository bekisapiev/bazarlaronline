# Деплой на beget.com

Полное руководство по развертыванию Bazarlar Online на сервере beget.com.

## Информация о сервере

- **IP адрес:** 46.173.18.202
- **Пользователь:** bazarlar
- **OS:** Ubuntu/Debian
- **Доступ:** SSH

## Требования

### На вашем компьютере:
- SSH клиент
- Git

### На сервере (будет установлено):
- Docker 20.10+
- Docker Compose 2.0+
- Nginx
- SSL сертификат (Let's Encrypt)

---

## Часть 1: Подготовка локального компьютера

### Шаг 1: Сборка frontend

Frontend нужно собрать локально, так как на сервере может не хватить памяти для сборки.

```bash
# Перейдите в директорию frontend
cd frontend

# Установите зависимости (если еще не установлены)
npm install

# Создайте production build
npm run build

# Проверьте что build создан
ls -la build/
```

Вы должны увидеть директорию `build/` с файлами приложения.

---

## Часть 2: Настройка сервера

### Шаг 1: Подключение к серверу

```bash
# Подключитесь к серверу
ssh bazarlar@46.173.18.202
```

### Шаг 2: Установка Docker

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

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Примените изменения группы
newgrp docker

# Проверьте установку
docker --version
docker compose version
```

### Шаг 3: Создание директории проекта

```bash
# Создайте директорию для проекта
sudo mkdir -p /var/www/bazarlaronline
sudo chown -R $USER:$USER /var/www/bazarlaronline
cd /var/www/bazarlaronline
```

### Шаг 4: Клонирование репозитория

```bash
# Клонируйте проект
git clone https://github.com/your-org/bazarlaronline.git .

# Проверьте что файлы загружены
ls -la
```

---

## Часть 3: Загрузка frontend build на сервер

### С локального компьютера (в новом терминале):

```bash
# Перейдите в директорию проекта (на локальной машине)
cd /path/to/bazarlaronline/frontend

# Загрузите build на сервер
scp -r build/ bazarlar@46.173.18.202:/var/www/bazarlaronline/frontend/

# Проверьте что файлы загружены
ssh bazarlar@46.173.18.202 "ls -la /var/www/bazarlaronline/frontend/build/"
```

---

## Часть 4: Настройка переменных окружения

### На сервере:

```bash
cd /var/www/bazarlaronline

# Создайте .env файл для backend
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql+asyncpg://bazarlar_user:CHANGE_THIS_PASSWORD@postgres:5432/bazarlar_prod
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bazarlar_prod
DB_USER=bazarlar_user
DB_PASSWORD=CHANGE_THIS_PASSWORD

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379

# JWT - ВАЖНО: Сгенерируйте случайный ключ!
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=525600
REFRESH_TOKEN_EXPIRE_DAYS=365

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback

# Application
API_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
ENVIRONMENT=production

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
EOF

# ВАЖНО: Измените пароль базы данных!
nano .env
# Найдите CHANGE_THIS_PASSWORD и замените на сильный пароль

# Сгенерируйте SECRET_KEY
openssl rand -hex 32
# Скопируйте результат и вставьте в .env как SECRET_KEY
```

**Обязательно измените:**
- `DB_PASSWORD` - сильный пароль для PostgreSQL
- `SECRET_KEY` - случайный ключ (команда выше генерирует)
- `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` - если используете Google OAuth
- `GOOGLE_REDIRECT_URI`, `API_URL`, `FRONTEND_URL` - ваш домен

---

## Часть 5: Создание docker-compose.yml для production

```bash
cd /var/www/bazarlaronline

# Создайте docker-compose.yml
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: bazarlar_postgres
    restart: always
    environment:
      POSTGRES_USER: bazarlar_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: bazarlar_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - bazarlar_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bazarlar_user -d bazarlar_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bazarlar_redis
    restart: always
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - bazarlar_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bazarlar_api
    restart: always
    env_file:
      - .env
    volumes:
      - ./backend:/app
      - uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - bazarlar_network
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: bazarlar_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/build:/usr/share/nginx/html:ro
      - uploads:/var/www/uploads:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - bazarlar_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads:
    driver: local

networks:
  bazarlar_network:
    driver: bridge
EOF
```

---

## Часть 6: Создание Dockerfile для backend

```bash
# Создайте Dockerfile в директории backend
cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей системы
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копирование requirements и установка Python зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Создание директории для загрузок
RUN mkdir -p /app/uploads

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
EOF
```

---

## Часть 7: Настройка Nginx

Nginx конфигурация уже есть в `deployment/nginx.conf`, но нужно её обновить для вашего домена:

```bash
# Отредактируйте nginx.conf
nano deployment/nginx.conf
```

Замените `your-domain.com` на ваш реальный домен во всех местах.

**Минимальная конфигурация nginx.conf:**

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Логирование
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Базовые настройки
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Upstream для API
    upstream api_backend {
        server api:8000;
    }

    # HTTP сервер (редирект на HTTPS)
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        # Для Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Редирект на HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS сервер
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL сертификаты
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL настройки
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # API endpoints
        location /api/ {
            proxy_pass http://api_backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # API docs
        location /docs {
            proxy_pass http://api_backend/docs;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /openapi.json {
            proxy_pass http://api_backend/openapi.json;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Uploaded files
        location /uploads/ {
            alias /var/www/uploads/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Frontend (React app)
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            expires 1h;
            add_header Cache-Control "public";
        }

        # Static files кэширование
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            root /usr/share/nginx/html;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## Часть 8: Получение SSL сертификата

### Вариант 1: Let's Encrypt (бесплатно, рекомендуется)

```bash
# Установите certbot
sudo apt install -y certbot

# Остановите nginx если запущен
sudo systemctl stop nginx

# Получите сертификат
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Скопируйте сертификаты в проект
sudo mkdir -p /var/www/bazarlaronline/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /var/www/bazarlaronline/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /var/www/bazarlaronline/ssl/
sudo chown -R $USER:$USER /var/www/bazarlaronline/ssl
```

### Вариант 2: Временный self-signed сертификат (для тестирования)

```bash
# Создайте директорию для SSL
mkdir -p /var/www/bazarlaronline/ssl

# Сгенерируйте self-signed сертификат
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /var/www/bazarlaronline/ssl/privkey.pem \
  -out /var/www/bazarlaronline/ssl/fullchain.pem \
  -subj "/C=KG/ST=Bishkek/L=Bishkek/O=Bazarlar/CN=your-domain.com"
```

**Примечание:** Self-signed сертификат вызовет предупреждение в браузере. Используйте только для тестирования!

---

## Часть 9: Запуск приложения

```bash
cd /var/www/bazarlaronline

# Соберите образы
docker compose -f docker-compose.prod.yml build

# Запустите контейнеры
docker compose -f docker-compose.prod.yml up -d

# Проверьте статус
docker compose -f docker-compose.prod.yml ps
```

**Ожидаемый вывод:**
```
NAME                SERVICE    STATUS      PORTS
bazarlar_postgres   postgres   running     5432/tcp
bazarlar_redis      redis      running     6379/tcp
bazarlar_api        api        running     8000/tcp
bazarlar_nginx      nginx      running     0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

## Часть 10: Инициализация базы данных

```bash
# Подождите 10 секунд пока PostgreSQL полностью запустится
sleep 10

# Создайте схему базы данных
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod < backend/database/schema.sql

# Загрузите начальные данные (опционально)
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod < backend/database/seed_data.sql

# Проверьте что таблицы созданы
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod -c "\dt"
```

---

## Часть 11: Проверка работы

### Проверка API

```bash
# Проверьте health endpoint
curl http://localhost:8000/health

# Проверьте через домен (замените на ваш домен)
curl https://your-domain.com/api/health
```

### Проверка Frontend

Откройте в браузере: `https://your-domain.com`

Вы должны увидеть главную страницу Bazarlar Online.

### Проверка логов

```bash
# Все логи
docker compose -f docker-compose.prod.yml logs -f

# Только API
docker compose -f docker-compose.prod.yml logs -f api

# Только Nginx
docker compose -f docker-compose.prod.yml logs -f nginx

# Только PostgreSQL
docker compose -f docker-compose.prod.yml logs -f postgres
```

---

## Часть 12: Автоматический запуск при перезагрузке

Docker Compose с флагом `restart: always` автоматически запустит контейнеры при перезагрузке сервера.

Но также можно настроить systemd сервис:

```bash
# Создайте systemd сервис
sudo cat > /etc/systemd/system/bazarlar.service << 'EOF'
[Unit]
Description=Bazarlar Online Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/bazarlaronline
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
User=bazarlar

[Install]
WantedBy=multi-user.target
EOF

# Включите и запустите сервис
sudo systemctl daemon-reload
sudo systemctl enable bazarlar.service
sudo systemctl start bazarlar.service

# Проверьте статус
sudo systemctl status bazarlar.service
```

---

## Обновление приложения

### Обновление кода

```bash
cd /var/www/bazarlaronline

# Получите последние изменения
git pull origin main

# Пересоберите и перезапустите
docker compose -f docker-compose.prod.yml up -d --build
```

### Обновление frontend

```bash
# На локальном компьютере:
cd frontend
npm run build
scp -r build/ bazarlar@46.173.18.202:/var/www/bazarlaronline/frontend/

# На сервере:
docker compose -f docker-compose.prod.yml restart nginx
```

### Применение миграций базы данных

```bash
cd /var/www/bazarlaronline

# Примените миграцию
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod < backend/database/migrations/migration_name.sql
```

---

## Резервное копирование

### Создание backup базы данных

```bash
# Создайте директорию для backups
mkdir -p /var/www/bazarlaronline/backups

# Создайте backup
docker exec bazarlar_postgres pg_dump -U bazarlar_user bazarlar_prod | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Автоматический backup (добавьте в crontab)
crontab -e
# Добавьте строку:
# 0 2 * * * cd /var/www/bazarlaronline && docker exec bazarlar_postgres pg_dump -U bazarlar_user bazarlar_prod | gzip > backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Восстановление из backup

```bash
# Распакуйте backup
gunzip backups/backup_20231212_020000.sql.gz

# Восстановите
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod < backups/backup_20231212_020000.sql
```

---

## Мониторинг

### Просмотр использования ресурсов

```bash
# Статистика контейнеров
docker stats

# Использование диска
df -h

# Использование памяти
free -h

# Процессы
htop
```

### Логи

```bash
# Размер логов
docker compose -f docker-compose.prod.yml logs --tail=0 | wc -l

# Очистка старых логов
docker compose -f docker-compose.prod.yml logs --tail=1000 > /dev/null
```

---

## Решение проблем

### Сервис не запускается

```bash
# Проверьте логи
docker compose -f docker-compose.prod.yml logs

# Проверьте статус
docker compose -f docker-compose.prod.yml ps

# Перезапустите
docker compose -f docker-compose.prod.yml restart
```

### База данных недоступна

```bash
# Проверьте что PostgreSQL работает
docker exec bazarlar_postgres pg_isready -U bazarlar_user

# Проверьте пароль в .env
cat .env | grep DB_PASSWORD

# Проверьте соединение
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod
```

### Nginx ошибки

```bash
# Проверьте конфигурацию
docker exec bazarlar_nginx nginx -t

# Перезапустите Nginx
docker compose -f docker-compose.prod.yml restart nginx

# Проверьте логи
docker compose -f docker-compose.prod.yml logs nginx
```

### SSL сертификат истек

```bash
# Обновите Let's Encrypt сертификат
sudo certbot renew

# Скопируйте новые сертификаты
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /var/www/bazarlaronline/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /var/www/bazarlaronline/ssl/

# Перезапустите Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Нехватка места на диске

```bash
# Очистите Docker
docker system prune -a --volumes

# Удалите старые backups
find /var/www/bazarlaronline/backups -name "*.sql.gz" -mtime +30 -delete

# Очистите логи
journalctl --vacuum-time=7d
```

---

## Безопасность

### Firewall

```bash
# Установите UFW
sudo apt install -y ufw

# Разрешите SSH
sudo ufw allow 22/tcp

# Разрешите HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включите firewall
sudo ufw enable

# Проверьте статус
sudo ufw status
```

### Обновления системы

```bash
# Регулярно обновляйте систему
sudo apt update && sudo apt upgrade -y

# Настройте автоматические обновления безопасности
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Мониторинг безопасности

```bash
# Установите fail2ban
sudo apt install -y fail2ban

# Настройте fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Производительность

### Оптимизация PostgreSQL

```bash
# Войдите в PostgreSQL
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod

# Выполните оптимизацию
VACUUM ANALYZE;
REINDEX DATABASE bazarlar_prod;
```

### Мониторинг производительности

```bash
# CPU и память
docker stats --no-stream

# Запросы к базе данных
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_prod -c "SELECT * FROM pg_stat_activity;"
```

---

## Готово!

Ваше приложение Bazarlar Online развернуто на beget.com!

### Checklist

- ✅ Docker установлен и настроен
- ✅ Проект клонирован на сервер
- ✅ Frontend собран и загружен
- ✅ Переменные окружения настроены
- ✅ SSL сертификат установлен
- ✅ Контейнеры запущены
- ✅ База данных инициализирована
- ✅ Сайт доступен по HTTPS
- ✅ Автозапуск настроен
- ✅ Резервное копирование настроено

### Доступ

- **Frontend:** https://your-domain.com
- **API Docs:** https://your-domain.com/docs
- **Admin:** https://your-domain.com/admin

### Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker compose -f docker-compose.prod.yml logs`
2. Проверьте статус: `docker compose -f docker-compose.prod.yml ps`
3. Откройте issue в GitHub
