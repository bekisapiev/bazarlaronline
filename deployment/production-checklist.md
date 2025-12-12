# Production Checklist для Bazarlar Online

Используйте этот чеклист перед запуском приложения в production.

## Безопасность

- [ ] Установлен сильный SECRET_KEY (минимум 32 символа)
- [ ] Изменены все дефолтные пароли базы данных
- [ ] Настроен firewall (только порты 22, 80, 443)
- [ ] Установлен SSL сертификат (HTTPS)
- [ ] Установлен и настроен fail2ban
- [ ] Отключен root login по SSH
- [ ] Настроена аутентификация по SSH ключу
- [ ] PostgreSQL доступен только локально
- [ ] Redis доступен только локально
- [ ] API запущен только на 127.0.0.1:8000 (не на 0.0.0.0)

## Конфигурация

- [ ] .env файл содержит production значения
- [ ] ENVIRONMENT=production в .env
- [ ] API_URL и FRONTEND_URL указывают на production домен
- [ ] CORS настроен только для production домена
- [ ] Google OAuth credentials настроены для production домена
- [ ] Google Cloud Vision credentials загружены
- [ ] MBank payment credentials настроены
- [ ] SMTP настроен для email уведомлений (опционально)

## База данных

- [ ] PostgreSQL установлен и запущен
- [ ] Создана production база данных
- [ ] Создан пользователь с сильным паролем
- [ ] Применены все миграции
- [ ] Настроено регулярное резервное копирование
- [ ] pg_hba.conf настроен правильно
- [ ] PostgreSQL оптимизирован для production (shared_buffers, etc.)

## Backend

- [ ] Python 3.11+ установлен
- [ ] Виртуальное окружение создано
- [ ] Все зависимости установлены
- [ ] Uvicorn запускается через systemd
- [ ] API service автоматически запускается при загрузке
- [ ] Celery worker запускается через systemd
- [ ] Директория uploads создана с правильными правами
- [ ] Логирование настроено
- [ ] DEBUG mode отключен

## Frontend

- [ ] Node.js 18+ установлен
- [ ] Production build создан (npm run build)
- [ ] Build скопирован в /var/www/bazarlaronline/frontend_dist
- [ ] API URL настроен на production домен
- [ ] React Router настроен правильно

## Nginx

- [ ] Nginx установлен и запущен
- [ ] Конфигурация проверена (nginx -t)
- [ ] SSL сертификаты установлены
- [ ] HTTP → HTTPS redirect настроен
- [ ] Проксирование API работает
- [ ] Статические файлы раздаются правильно
- [ ] Загрузка файлов работает (client_max_body_size)
- [ ] Gzip compression включен
- [ ] Security headers установлены
- [ ] Rate limiting настроен (опционально)

## Redis

- [ ] Redis установлен и запущен
- [ ] maxmemory настроен
- [ ] maxmemory-policy установлен
- [ ] Redis persistence настроен

## Мониторинг

- [ ] Все systemd сервисы запущены и enabled
- [ ] Логи доступны через journalctl
- [ ] Настроена ротация логов
- [ ] Мониторинг дискового пространства
- [ ] Мониторинг использования памяти
- [ ] Uptime monitoring настроен (опционально)
- [ ] Error tracking настроен (опционально, например Sentry)

## Резервное копирование

- [ ] Настроено автоматическое резервное копирование базы данных
- [ ] Настроено резервное копирование uploads директории
- [ ] Резервная копия .env файла сохранена
- [ ] Протестировано восстановление из backup

## Производительность

- [ ] PostgreSQL оптимизирован (shared_buffers, work_mem, etc.)
- [ ] Redis maxmemory настроен
- [ ] Nginx caching настроен
- [ ] Uvicorn запущен с несколькими workers (4+)
- [ ] Celery concurrency настроен
- [ ] Static files caching настроен в Nginx

## DNS и Домен

- [ ] A запись указывает на IP сервера
- [ ] www поддомен настроен (опционально)
- [ ] SSL работает для всех доменов
- [ ] CDN настроен для статики (опционально)

## Тестирование

- [ ] Регистрация работает
- [ ] Аутентификация работает (Google, Email)
- [ ] Создание товара работает
- [ ] Загрузка изображений работает
- [ ] Поиск работает
- [ ] Платежи работают (MBank)
- [ ] Реферальная программа работает
- [ ] Email уведомления работают
- [ ] Админ панель доступна
- [ ] Все API endpoints работают
- [ ] WebSocket подключение работает

## Финальные проверки

- [ ] Нет ошибок в логах
- [ ] Все сервисы запущены
- [ ] SSL certificate валиден
- [ ] Сайт доступен по HTTPS
- [ ] Мобильная версия работает
- [ ] SEO метатеги установлены
- [ ] robots.txt настроен
- [ ] sitemap.xml создан (опционально)
- [ ] Google Analytics настроен (опционально)
- [ ] Yandex Metrica настроен (опционально)

## Post-Deploy

- [ ] Протестировать основные функции
- [ ] Проверить производительность
- [ ] Настроить мониторинг и алерты
- [ ] Документировать все настройки
- [ ] Создать runbook для типичных проблем
- [ ] Обучить команду поддержки

## Команды для проверки

```bash
# Проверка всех сервисов
sudo systemctl is-active bazarlar-api bazarlar-celery nginx postgresql redis-server

# Проверка SSL
curl -I https://your_domain.com

# Проверка API
curl https://your_domain.com/api/v1/health

# Проверка логов
sudo journalctl -u bazarlar-api -n 50 --no-pager

# Проверка портов
sudo netstat -tulpn | grep LISTEN

# Проверка дискового пространства
df -h

# Проверка памяти
free -h

# Проверка firewall
sudo ufw status

# Проверка базы данных
psql -h localhost -U bazarlar_user -d bazarlar_prod -c "SELECT COUNT(*) FROM products;"
```

## Важные файлы для резервного копирования

1. `/var/www/bazarlaronline/backend/.env` - Переменные окружения
2. `/var/www/bazarlaronline/backend/google-credentials.json` - Google credentials
3. База данных PostgreSQL
4. `/var/www/bazarlaronline/uploads/` - Загруженные файлы
5. `/etc/nginx/sites-available/bazarlaronline` - Nginx конфигурация
6. `/etc/systemd/system/bazarlar-*.service` - Systemd services

---

**После завершения всех пунктов, ваше приложение готово к production использованию!**
