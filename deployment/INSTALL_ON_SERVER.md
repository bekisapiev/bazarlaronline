# Установка на сервер - Решение проблем

Если вы получаете ошибку `Syntax error: newline unexpected`, это означает проблему с форматом конца строк в скриптах.

## Решение 1: Клонируйте репозиторий напрямую на сервере (РЕКОМЕНДУЕТСЯ)

```bash
# На сервере выполните:
cd /var/www
sudo git clone https://github.com/ваш_пользователь/bazarlaronline.git
cd bazarlaronline

# Убедитесь, что скрипты исполняемые:
sudo chmod +x deployment/*.sh

# Запустите установку:
sudo ./deployment/initial-setup.sh
```

## Решение 2: Исправьте формат конца строк на сервере

Если вы скачали/скопировали файлы вручную:

```bash
# Установите dos2unix
sudo apt-get install dos2unix

# Конвертируйте все скрипты:
cd /var/www/bazarlaronline/deployment
sudo dos2unix initial-setup.sh
sudo dos2unix deploy.sh

# Сделайте исполняемыми:
sudo chmod +x *.sh

# Запустите:
sudo ./initial-setup.sh
```

## Решение 3: Используйте sed для исправления

```bash
cd /var/www/bazarlaronline/deployment

# Удалите Windows-style окончания строк:
sudo sed -i 's/\r$//' initial-setup.sh
sudo sed -i 's/\r$//' deploy.sh

# Сделайте исполняемыми:
sudo chmod +x *.sh

# Запустите:
sudo ./initial-setup.sh
```

## Решение 4: Пересоздайте скрипт вручную на сервере

Если ничего не помогает, создайте скрипт вручную:

```bash
cd /var/www/bazarlaronline

# Создайте новый скрипт установки:
sudo nano quick-install.sh
```

Скопируйте и вставьте следующий код:

```bash
#!/usr/bin/env bash
set -e

echo "Updating system..."
apt update && apt upgrade -y

echo "Installing essential packages..."
apt install -y git curl wget build-essential software-properties-common ufw fail2ban

echo "Installing Python 3.11..."
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

echo "Installing Redis..."
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server

echo "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

echo "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

echo "Creating directories..."
mkdir -p /var/www/bazarlaronline
mkdir -p /var/www/bazarlaronline/uploads
mkdir -p /var/www/bazarlaronline/frontend_dist
chown -R www-data:www-data /var/www/bazarlaronline
chmod -R 755 /var/www/bazarlaronline
chmod -R 775 /var/www/bazarlaronline/uploads

echo "Installation completed!"
echo "Next: Follow DEPLOYMENT.md for database setup and application deployment"
```

Сохраните (Ctrl+O, Enter, Ctrl+X) и запустите:

```bash
sudo chmod +x quick-install.sh
sudo ./quick-install.sh
```

## Решение 5: Пошаговая установка вручную

Если скрипты не работают, выполните команды вручную:

```bash
# 1. Обновите систему
sudo apt update && sudo apt upgrade -y

# 2. Установите Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# 3. Установите Node.js
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

# 7. Настройте firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 8. Создайте директории
sudo mkdir -p /var/www/bazarlaronline
sudo chown -R $USER:$USER /var/www/bazarlaronline
```

После этого следуйте инструкциям из `DEPLOYMENT.md` начиная с раздела "Настройка базы данных".

## Проверка после установки

```bash
# Проверьте версии установленного ПО:
python3.11 --version
node --version
npm --version
psql --version
redis-cli --version
nginx -v

# Проверьте статус сервисов:
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
```

## Получение поддержки

Если проблемы продолжаются:

1. Проверьте версию вашей ОС: `cat /etc/os-release`
2. Проверьте версию bash: `bash --version`
3. Отправьте полный вывод ошибки
4. Проверьте права доступа к файлам: `ls -la deployment/`

## Альтернатива: Docker (если базовая установка не работает)

Если у вас продолжаются проблемы с установкой, можно использовать Docker:

```bash
# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установите Docker Compose
sudo apt install docker-compose -y

# Используйте docker-compose.yml из репозитория
cd /var/www/bazarlaronline
sudo docker-compose up -d
```

---

**Важно:** Всегда используйте `git clone` для получения файлов, а не копируйте/вставляйте вручную!
