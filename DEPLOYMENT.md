# Руководство по деплою Bazarlar Online на VPS

Это подробное руководство по развертыванию платформы Bazarlar Online на VPS сервере (Beget.com или любой другой Ubuntu/Debian VPS).

## Содержание

1. [Требования к серверу](#требования-к-серверу)
2. [Начальная настройка сервера](#начальная-настройка-сервера)
3. [Настройка базы данных](#настройка-базы-данных)
4. [Развертывание backend](#развертывание-backend)
5. [Развертывание frontend](#развертывание-frontend)
6. [Настройка Nginx](#настройка-nginx)
7. [Настройка systemd сервисов](#настройка-systemd-сервисов)
8. [Получение SSL сертификата](#получение-ssl-сертификата)
9. [Обновление приложения](#обновление-приложения)
10. [Мониторинг и логи](#мониторинг-и-логи)
11. [Решение проблем](#решение-проблем)

---

## Требования к серверу

### Минимальные требования:
- **OS:** Ubuntu 20.04+ или Debian 11+
- **RAM:** 2 GB (рекомендуется 4 GB)
- **CPU:** 2 ядра
- **Диск:** 20 GB SSD
- **Домен:** Зарегистрированный домен с настроенными DNS записями

### Необходимое ПО:
- Python 3.11+
- Node.js 18.x
- PostgreSQL 14+
- Redis 6+
- Nginx
- Git

---

## Начальная настройка сервера

### Шаг 1: Подключитесь к серверу по SSH

```bash
ssh root@ваш_ip_адрес
```

### Шаг 2: Обновите систему

```bash
apt update && apt upgrade -y
```

### Шаг 3: Создайте нового пользователя (опционально, но рекомендуется)

```bash
adduser bazarlar
usermod -aG sudo bazarlar
su - bazarlar
```

### Шаг 4: Запустите автоматическую установку

Скачайте и запустите скрипт начальной установки:

```bash
cd /tmp
wget https://raw.githubusercontent.com/ваш_репозиторий/main/deployment/initial-setup.sh
chmod +x initial-setup.sh
sudo ./initial-setup.sh
```

Или выполните установку вручную:

```bash
# 1. Установите основные пакеты
sudo apt install -y git curl wget build-essential software-properties-common ufw fail2ban

# 2. Установите Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# 3. Установите Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# 4. Установите PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. Установите Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 6. Установите Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 7. Установите Certbot для SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Шаг 5: Настройте firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Настройка базы данных

### Шаг 1: Создайте базу данных и пользователя PostgreSQL

```bash
sudo -u postgres psql
```

В PostgreSQL консоли выполните:

```sql
-- Создайте пользователя
CREATE USER bazarlar_user WITH PASSWORD 'ваш_сильный_пароль';

-- Создайте базу данных
CREATE DATABASE bazarlar_prod OWNER bazarlar_user;

-- Дайте права пользователю
GRANT ALL PRIVILEGES ON DATABASE bazarlar_prod TO bazarlar_user;

-- Для PostgreSQL 15+ также выполните:
\c bazarlar_prod
GRANT ALL ON SCHEMA public TO bazarlar_user;
GRANT CREATE ON SCHEMA public TO bazarlar_user;

-- Выход
\q
```

### Шаг 2: Настройте PostgreSQL для локального подключения

Отредактируйте `pg_hba.conf`:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Убедитесь, что есть строка:

```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

Перезапустите PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### Шаг 3: Проверьте подключение

```bash
psql -h localhost -U bazarlar_user -d bazarlar_prod
```

---

## Развертывание Backend

### Шаг 1: Клонируйте репозиторий

```bash
cd /var/www
sudo mkdir -p bazarlaronline
sudo chown -R $USER:$USER bazarlaronline
cd bazarlaronline

git clone https://github.com/ваш_пользователь/bazarlaronline.git .
```

### Шаг 2: Создайте виртуальное окружение Python

```bash
python3.11 -m venv /var/www/bazarlaronline/venv
source /var/www/bazarlaronline/venv/bin/activate
```

### Шаг 3: Установите зависимости

```bash
cd /var/www/bazarlaronline/backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Шаг 4: Настройте переменные окружения

```bash
cd /var/www/bazarlaronline/backend
cp ../deployment/.env.production .env
nano .env
```

Отредактируйте `.env` файл, заменив все `CHANGE_THIS` значения:

```env
# Database
DATABASE_URL=postgresql+asyncpg://bazarlar_user:ваш_пароль@localhost:5432/bazarlar_prod
DB_PASSWORD=ваш_пароль

# Security (сгенерируйте секретный ключ)
SECRET_KEY=$(openssl rand -hex 32)

# URLs
API_URL=https://ваш_домен/api
FRONTEND_URL=https://ваш_домен

# И другие настройки...
```

Для генерации секретного ключа:

```bash
openssl rand -hex 32
```

### Шаг 5: Примените миграции базы данных

```bash
cd /var/www/bazarlaronline/backend

# Выполните все миграции
for migration in migrations/*.sql; do
    echo "Applying $migration..."
    sudo -u postgres psql -d bazarlar_prod -f "$migration"
done
```

### Шаг 6: Создайте директории для загрузок

```bash
sudo mkdir -p /var/www/bazarlaronline/uploads
sudo chown -R www-data:www-data /var/www/bazarlaronline/uploads
sudo chmod -R 775 /var/www/bazarlaronline/uploads
```

### Шаг 7: Загрузите Google Cloud credentials (для AI модерации)

```bash
# Скопируйте ваш google-credentials.json на сервер
sudo nano /var/www/bazarlaronline/backend/google-credentials.json
# Вставьте содержимое вашего credentials файла
```

### Шаг 8: Проверьте работу backend

```bash
cd /var/www/bazarlaronline/backend
source /var/www/bazarlaronline/venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Откройте в браузере: `http://ваш_ip:8000/docs`

Если все работает, остановите uvicorn (Ctrl+C).

---

## Развертывание Frontend

### Шаг 1: Установите зависимости

```bash
cd /var/www/bazarlaronline/frontend
npm install
```

### Шаг 2: Настройте API URL для production

Отредактируйте файл конфигурации API:

```bash
nano src/services/api.ts
```

Убедитесь, что baseURL указывает на ваш домен:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ваш_домен/api';
```

Или создайте `.env` файл в директории frontend:

```bash
nano /var/www/bazarlaronline/frontend/.env
```

```env
REACT_APP_API_URL=https://ваш_домен/api
```

### Шаг 3: Соберите production build

```bash
cd /var/www/bazarlaronline/frontend
npm run build
```

### Шаг 4: Скопируйте build в рабочую директорию

```bash
sudo mkdir -p /var/www/bazarlaronline/frontend_dist
sudo cp -r build/* /var/www/bazarlaronline/frontend_dist/
sudo chown -R www-data:www-data /var/www/bazarlaronline/frontend_dist
```

---

## Настройка Nginx

### Шаг 1: Скопируйте конфигурацию Nginx

```bash
sudo cp /var/www/bazarlaronline/deployment/nginx.conf /etc/nginx/sites-available/bazarlaronline
```

### Шаг 2: Отредактируйте конфигурацию

```bash
sudo nano /etc/nginx/sites-available/bazarlaronline
```

Замените все `YOUR_DOMAIN` на ваш реальный домен:

```bash
sudo sed -i 's/YOUR_DOMAIN/ваш_домен.com/g' /etc/nginx/sites-available/bazarlaronline
```

### Шаг 3: Создайте symlink

```bash
sudo ln -s /etc/nginx/sites-available/bazarlaronline /etc/nginx/sites-enabled/
```

### Шаг 4: Удалите дефолтную конфигурацию

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Шаг 5: Проверьте конфигурацию

```bash
sudo nginx -t
```

### Шаг 6: Временно настройте для HTTP (без SSL)

Закомментируйте SSL секцию в nginx конфигурации для первоначальной проверки:

```bash
sudo nano /etc/nginx/sites-available/bazarlaronline
```

Временно закомментируйте SSL server block (строки 26-113) и используйте только HTTP server block.

### Шаг 7: Перезапустите Nginx

```bash
sudo systemctl restart nginx
```

---

## Настройка systemd сервисов

### Шаг 1: Скопируйте service файлы

```bash
sudo cp /var/www/bazarlaronline/deployment/bazarlar-api.service /etc/systemd/system/
sudo cp /var/www/bazarlaronline/deployment/bazarlar-celery.service /etc/systemd/system/
```

### Шаг 2: Обновите права доступа

```bash
sudo chown -R www-data:www-data /var/www/bazarlaronline
sudo chmod -R 755 /var/www/bazarlaronline
```

### Шаг 3: Перезагрузите systemd

```bash
sudo systemctl daemon-reload
```

### Шаг 4: Запустите сервисы

```bash
# Запустите API
sudo systemctl start bazarlar-api
sudo systemctl enable bazarlar-api

# Запустите Celery
sudo systemctl start bazarlar-celery
sudo systemctl enable bazarlar-celery
```

### Шаг 5: Проверьте статус

```bash
sudo systemctl status bazarlar-api
sudo systemctl status bazarlar-celery
```

---

## Получение SSL сертификата

### Шаг 1: Убедитесь, что ваш домен указывает на IP сервера

Проверьте DNS записи:

```bash
nslookup ваш_домен.com
dig ваш_домен.com
```

### Шаг 2: Получите SSL сертификат с помощью Certbot

```bash
sudo certbot --nginx -d ваш_домен.com -d www.ваш_домен.com
```

Следуйте инструкциям Certbot. Он автоматически обновит конфигурацию Nginx.

### Шаг 3: Раскомментируйте SSL конфигурацию в Nginx

```bash
sudo nano /etc/nginx/sites-available/bazarlaronline
```

Раскомментируйте SSL server block (если вы его комментировали).

### Шаг 4: Перезапустите Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Шаг 5: Настройте автоматическое обновление сертификата

Certbot автоматически добавляет cron job, но проверьте:

```bash
sudo certbot renew --dry-run
```

---

## Обновление приложения

После внесения изменений в код и push в репозиторий:

### Автоматическое обновление (рекомендуется)

```bash
cd /var/www/bazarlaronline
sudo ./deployment/deploy.sh
```

### Ручное обновление

```bash
# 1. Pull последнего кода
cd /var/www/bazarlaronline
git pull origin main

# 2. Обновите backend зависимости
source /var/www/bazarlaronline/venv/bin/activate
cd backend
pip install -r requirements.txt --upgrade

# 3. Примените новые миграции (если есть)
for migration in migrations/*.sql; do
    sudo -u postgres psql -d bazarlar_prod -f "$migration"
done

# 4. Соберите frontend
cd /var/www/bazarlaronline/frontend
npm install
npm run build
sudo cp -r build/* /var/www/bazarlaronline/frontend_dist/

# 5. Перезапустите сервисы
sudo systemctl restart bazarlar-api
sudo systemctl restart bazarlar-celery
sudo systemctl reload nginx
```

---

## Мониторинг и логи

### Просмотр логов в реальном времени

```bash
# API логи
sudo journalctl -u bazarlar-api -f

# Celery логи
sudo journalctl -u bazarlar-celery -f

# Nginx логи доступа
sudo tail -f /var/log/nginx/access.log

# Nginx логи ошибок
sudo tail -f /var/log/nginx/error.log

# PostgreSQL логи
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Redis логи
sudo tail -f /var/log/redis/redis-server.log
```

### Проверка статуса сервисов

```bash
# Все сервисы
sudo systemctl status bazarlar-api
sudo systemctl status bazarlar-celery
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis-server

# Быстрая проверка всех сервисов
sudo systemctl is-active bazarlar-api bazarlar-celery nginx postgresql redis-server
```

### Мониторинг ресурсов

```bash
# CPU и память
htop

# Дисковое пространство
df -h

# Использование памяти
free -h

# Сетевые подключения
sudo netstat -tulpn | grep LISTEN
```

---

## Решение проблем

### API не запускается

```bash
# Проверьте логи
sudo journalctl -u bazarlar-api -n 50

# Проверьте подключение к базе данных
psql -h localhost -U bazarlar_user -d bazarlar_prod

# Проверьте права доступа
ls -la /var/www/bazarlaronline/backend

# Попробуйте запустить вручную
cd /var/www/bazarlaronline/backend
source /var/www/bazarlaronline/venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Nginx выдает 502 Bad Gateway

```bash
# Убедитесь, что API запущен
sudo systemctl status bazarlar-api

# Проверьте, что API слушает на порту 8000
sudo netstat -tulpn | grep 8000

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### База данных не доступна

```bash
# Проверьте статус PostgreSQL
sudo systemctl status postgresql

# Проверьте подключение
psql -h localhost -U bazarlar_user -d bazarlar_prod

# Проверьте логи PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### SSL сертификат не работает

```bash
# Проверьте сертификаты
sudo certbot certificates

# Обновите сертификаты
sudo certbot renew

# Проверьте конфигурацию Nginx
sudo nginx -t
```

### Frontend показывает ошибки CORS

Проверьте настройки CORS в backend:

```bash
nano /var/www/bazarlaronline/backend/app/main.py
```

Убедитесь, что ваш домен указан в `allow_origins`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ваш_домен.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Файлы не загружаются

```bash
# Проверьте права доступа к директории uploads
ls -la /var/www/bazarlaronline/uploads

# Установите правильные права
sudo chown -R www-data:www-data /var/www/bazarlaronline/uploads
sudo chmod -R 775 /var/www/bazarlaronline/uploads

# Проверьте размер клиента в Nginx
sudo nano /etc/nginx/sites-available/bazarlaronline
# Найдите: client_max_body_size 50M;
```

---

## Резервное копирование

### Backup базы данных

```bash
# Создайте backup директорию
sudo mkdir -p /var/backups/bazarlaronline

# Создайте backup базы данных
sudo -u postgres pg_dump bazarlar_prod > /var/backups/bazarlaronline/db_backup_$(date +%Y%m%d_%H%M%S).sql

# Создайте автоматический backup (cron job)
sudo crontab -e

# Добавьте (backup каждый день в 2:00 AM):
0 2 * * * sudo -u postgres pg_dump bazarlar_prod > /var/backups/bazarlaronline/db_backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### Backup файлов

```bash
# Backup директории uploads
sudo tar -czf /var/backups/bazarlaronline/uploads_backup_$(date +%Y%m%d).tar.gz /var/www/bazarlaronline/uploads

# Backup .env файла
sudo cp /var/www/bazarlaronline/backend/.env /var/backups/bazarlaronline/.env.backup
```

### Восстановление из backup

```bash
# Восстановить базу данных
sudo -u postgres psql bazarlar_prod < /var/backups/bazarlaronline/db_backup_XXXXXX.sql

# Восстановить uploads
sudo tar -xzf /var/backups/bazarlaronline/uploads_backup_XXXXXX.tar.gz -C /
```

---

## Оптимизация производительности

### PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Рекомендуемые настройки для 4GB RAM:

```conf
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 8MB
max_connections = 200
```

### Nginx кэширование

Добавьте в nginx конфигурацию:

```nginx
# Кэш для статических файлов
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;
```

### Redis настройки

```bash
sudo nano /etc/redis/redis.conf
```

```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## Контакты и поддержка

При возникновении проблем:

1. Проверьте логи сервисов
2. Обратитесь к разделу "Решение проблем" выше
3. Создайте issue в GitHub репозитории

---

**Поздравляем! Ваше приложение Bazarlar Online успешно развернуто!**

Теперь ваша платформа доступна по адресу: `https://ваш_домен.com`
