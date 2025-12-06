# Быстрый деплой Bazarlar Online

Краткая инструкция для опытных пользователей. Для подробной информации см. [DEPLOYMENT.md](../DEPLOYMENT.md).

## Предварительные требования

- Ubuntu 20.04+ / Debian 11+
- Домен с настроенными DNS записями
- SSH доступ к серверу

## Быстрая установка

### 1. Подключение и начальная настройка

```bash
ssh root@your_server_ip

# Запустите скрипт автоматической установки
cd /var/www
git clone https://github.com/ваш_репозиторий/bazarlaronline.git
cd bazarlaronline
sudo chmod +x deployment/initial-setup.sh
sudo ./deployment/initial-setup.sh
```

### 2. Настройка PostgreSQL

```bash
sudo -u postgres psql << EOF
CREATE USER bazarlar_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE bazarlar_prod OWNER bazarlar_user;
GRANT ALL PRIVILEGES ON DATABASE bazarlar_prod TO bazarlar_user;
\c bazarlar_prod
GRANT ALL ON SCHEMA public TO bazarlar_user;
EOF
```

### 3. Backend

```bash
cd /var/www/bazarlaronline
python3.11 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt

# Настройте .env
cp ../deployment/.env.production .env
nano .env  # Отредактируйте значения

# Примените миграции
for migration in migrations/*.sql; do
    sudo -u postgres psql -d bazarlar_prod -f "$migration"
done
```

### 4. Frontend

```bash
cd /var/www/bazarlaronline/frontend
echo "REACT_APP_API_URL=https://your_domain.com/api" > .env
npm install
npm run build
sudo mkdir -p /var/www/bazarlaronline/frontend_dist
sudo cp -r build/* /var/www/bazarlaronline/frontend_dist/
```

### 5. Systemd сервисы

```bash
sudo cp deployment/bazarlar-api.service /etc/systemd/system/
sudo cp deployment/bazarlar-celery.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now bazarlar-api bazarlar-celery
```

### 6. Nginx

```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/bazarlaronline
sudo sed -i 's/YOUR_DOMAIN/your_domain.com/g' /etc/nginx/sites-available/bazarlaronline
sudo ln -s /etc/nginx/sites-available/bazarlaronline /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL сертификат

```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

### 8. Права доступа

```bash
sudo chown -R www-data:www-data /var/www/bazarlaronline
sudo chmod -R 755 /var/www/bazarlaronline
sudo chmod -R 775 /var/www/bazarlaronline/uploads
```

## Проверка

```bash
# Проверьте статус сервисов
sudo systemctl status bazarlar-api bazarlar-celery nginx postgresql redis-server

# Проверьте логи
sudo journalctl -u bazarlar-api -f
```

## Обновление

```bash
cd /var/www/bazarlaronline
sudo ./deployment/deploy.sh
```

## Полезные команды

```bash
# Логи API
sudo journalctl -u bazarlar-api -f

# Логи Celery
sudo journalctl -u bazarlar-celery -f

# Перезапуск сервисов
sudo systemctl restart bazarlar-api bazarlar-celery

# Перезагрузка Nginx
sudo nginx -t && sudo systemctl reload nginx
```

## Переменные окружения (.env)

Основные переменные, которые нужно изменить:

```env
DATABASE_URL=postgresql+asyncpg://bazarlar_user:PASSWORD@localhost:5432/bazarlar_prod
SECRET_KEY=$(openssl rand -hex 32)
API_URL=https://your_domain.com/api
FRONTEND_URL=https://your_domain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TELEGRAM_BOT_TOKEN=...
MBANK_MERCHANT_ID=...
MBANK_API_KEY=...
```

## Готово!

Ваш сайт доступен по адресу: `https://your_domain.com`

Для подробной информации см. [DEPLOYMENT.md](../DEPLOYMENT.md)
