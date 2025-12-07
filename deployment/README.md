# Deployment Files

Эта директория содержит все файлы, необходимые для развертывания Bazarlar Online на production сервере.

## Файлы

### Конфигурационные файлы

- **nginx.conf** - Конфигурация Nginx для проксирования API и раздачи статики
- **bazarlar-api.service** - Systemd service для FastAPI приложения
- **bazarlar-celery.service** - Systemd service для Celery worker
- **.env.production** - Шаблон production переменных окружения

### Скрипты

- **initial-setup.sh** - Скрипт первоначальной установки сервера (запускается один раз)
- **deploy.sh** - Скрипт обновления приложения (запускается при каждом деплое)

### Документация

- **QUICK_DEPLOY.md** - Краткая инструкция по деплою для опытных пользователей
- **../DEPLOYMENT.md** - Подробное руководство по деплою (в корне проекта)

## Использование

### Первоначальная установка

1. Подключитесь к серверу по SSH
2. Запустите скрипт начальной установки:
   ```bash
   sudo ./deployment/initial-setup.sh
   ```
3. Следуйте инструкциям в [DEPLOYMENT.md](../DEPLOYMENT.md)

### Обновление приложения

```bash
cd /var/www/bazarlaronline
sudo ./deployment/deploy.sh
```

## Структура после деплоя

```
/var/www/bazarlaronline/
├── backend/              # Backend код
│   ├── app/
│   ├── migrations/
│   ├── .env             # Production переменные окружения
│   └── requirements.txt
├── frontend/            # Frontend исходники
│   ├── src/
│   ├── public/
│   └── package.json
├── frontend_dist/       # Собранный frontend (production)
├── uploads/            # Загруженные файлы пользователей
├── venv/              # Python виртуальное окружение
└── deployment/        # Эта директория
```

## Системные сервисы

После деплоя будут запущены следующие systemd сервисы:

- `bazarlar-api.service` - FastAPI backend на порту 8000
- `bazarlar-celery.service` - Celery worker для фоновых задач
- `nginx` - Веб-сервер и reverse proxy
- `postgresql` - База данных
- `redis-server` - Кэш и очередь сообщений

## Порты

- **80** - HTTP (редирект на HTTPS)
- **443** - HTTPS (основной доступ к приложению)
- **8000** - FastAPI (доступен только локально)
- **5432** - PostgreSQL (доступен только локально)
- **6379** - Redis (доступен только локально)

## Безопасность

### Firewall настройки

```bash
sudo ufw status
```

Должны быть открыты только:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

### SSL сертификат

SSL сертификат устанавливается с помощью Let's Encrypt:

```bash
sudo certbot --nginx -d your_domain.com
```

Автоматическое обновление настроено через cron.

## Мониторинг

### Просмотр логов

```bash
# API логи
sudo journalctl -u bazarlar-api -f

# Celery логи
sudo journalctl -u bazarlar-celery -f

# Nginx логи
sudo tail -f /var/log/nginx/error.log
```

### Проверка статуса

```bash
# Все сервисы
sudo systemctl status bazarlar-api bazarlar-celery nginx postgresql redis-server

# Быстрая проверка
sudo systemctl is-active bazarlar-api
```

## Резервное копирование

### База данных

```bash
sudo -u postgres pg_dump bazarlar_prod > backup_$(date +%Y%m%d).sql
```

### Файлы

```bash
sudo tar -czf uploads_backup.tar.gz /var/www/bazarlaronline/uploads
```

## Решение проблем

### API не работает

```bash
# Проверьте логи
sudo journalctl -u bazarlar-api -n 50

# Перезапустите сервис
sudo systemctl restart bazarlar-api
```

### 502 Bad Gateway

```bash
# Убедитесь, что API запущен
sudo systemctl status bazarlar-api

# Проверьте подключение
curl http://127.0.0.1:8000/api/v1/health
```

### База данных недоступна

```bash
# Проверьте PostgreSQL
sudo systemctl status postgresql

# Проверьте подключение
psql -h localhost -U bazarlar_user -d bazarlar_prod
```

## Дополнительная информация

Для подробной информации см.:
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Полное руководство по деплою
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - Краткая инструкция
