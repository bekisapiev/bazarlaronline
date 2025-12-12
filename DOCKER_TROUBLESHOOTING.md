# Решение проблем с Docker на beget.com

## Проблема: PostgreSQL не запускается в Docker

### Основные изменения в конфигурации

**ВАЖНО**: Проект использует PostgreSQL 15 для совместимости с VPS сервером beget.com.

В обновленной версии `docker-compose.yml` внесены следующие исправления:

1. **Изменен внешний порт PostgreSQL**: `54320:5432` вместо `5432:5432`
   - Избегаем конфликтов с другими службами на сервере

2. **Добавлена оптимизация для ограниченных ресурсов**:
   ```yaml
   POSTGRES_SHARED_BUFFERS: 128MB
   POSTGRES_MAX_CONNECTIONS: 50
   POSTGRES_WORK_MEM: 4MB
   ```

3. **Добавлена политика перезапуска**: `restart: unless-stopped`
   - Контейнеры будут автоматически перезапускаться при сбоях

4. **Улучшены healthcheck настройки**:
   - Увеличены интервалы и таймауты
   - Добавлен `start_period: 40s` для корректной инициализации

### Инструкции по запуску

#### 1. Остановите и удалите старые контейнеры

```bash
docker-compose down -v
```

**Внимание**: Флаг `-v` удалит все данные! Используйте только если готовы потерять данные БД.

Если нужно сохранить данные:
```bash
docker-compose down
```

#### 2. Запустите контейнеры заново

```bash
docker-compose up -d
```

#### 3. Проверьте статус контейнеров

```bash
docker-compose ps
```

Все контейнеры должны быть в статусе `Up` или `Up (healthy)`.

#### 4. Запустите скрипт диагностики

```bash
./docker-diagnose.sh
```

### Проверка логов PostgreSQL

Если PostgreSQL не запускается, проверьте логи:

```bash
docker-compose logs postgres
```

Или в режиме реального времени:

```bash
docker-compose logs -f postgres
```

### Распространенные проблемы и решения

#### Проблема 1: "permission denied" при доступе к volume

**Решение**:
```bash
sudo chown -R 999:999 postgres_data/
```

или пересоздайте volume:
```bash
docker-compose down -v
docker volume rm bazarlaronline_postgres_data
docker-compose up -d
```

#### Проблема 2: "port is already allocated"

**Решение**: Проверьте, занят ли порт 54320

```bash
netstat -tuln | grep 54320
# или
ss -tuln | grep 54320
```

Если порт занят, измените его в `docker-compose.yml`:
```yaml
ports:
  - "54321:5432"  # или другой свободный порт
```

#### Проблема 3: PostgreSQL постоянно перезапускается

**Причина**: Недостаточно памяти или дискового пространства

**Решение**:

1. Проверьте доступную память:
```bash
free -h
```

2. Проверьте дисковое пространство:
```bash
df -h
```

3. Если памяти мало, уменьшите параметры PostgreSQL в `docker-compose.yml`:
```yaml
POSTGRES_SHARED_BUFFERS: 64MB
POSTGRES_MAX_CONNECTIONS: 20
POSTGRES_WORK_MEM: 2MB
```

#### Проблема 4: "could not translate host name postgres"

**Причина**: Проблемы с Docker network

**Решение**:
```bash
docker network create bazarlar_network
docker-compose up -d
```

#### Проблема 5: Долгая инициализация БД

**Причина**: Файл `init.sql` выполняется при первом запуске

**Решение**: Подождите 1-2 минуты и проверьте статус:
```bash
docker exec bazarlar_postgres pg_isready -U bazarlar_user -d bazarlar_claude
```

### Проверка подключения к PostgreSQL

#### Изнутри контейнера:

```bash
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
```

#### С хоста (используйте порт 54320):

```bash
psql -h localhost -p 54320 -U bazarlar_user -d bazarlar_claude
```

Пароль: `bazarlar_pass` (из docker-compose.yml)

### Полная переустановка (если ничего не помогло)

```bash
# Остановить все контейнеры
docker-compose down -v

# Удалить все volumes
docker volume prune -f

# Удалить все неиспользуемые образы
docker image prune -a -f

# Пересобрать и запустить
docker-compose build --no-cache
docker-compose up -d
```

### Мониторинг ресурсов

Проверьте использование ресурсов контейнерами:

```bash
docker stats
```

### Ограничения на beget.com

На хостинге beget.com могут быть следующие ограничения:

1. **Ограничение по памяти**: Обычно 512MB-1GB на процесс
2. **Ограничение по CPU**: Квоты на использование процессора
3. **Ограничение портов**: Некоторые порты могут быть заблокированы
4. **Timeout**: Длительные операции могут прерываться

Для работы в этих ограничениях:
- Используйте alpine образы (они легче)
- Оптимизируйте настройки PostgreSQL
- Избегайте запуска всех сервисов одновременно

### Рекомендации для production на beget.com

1. **Запускайте только необходимые сервисы**:
```bash
docker-compose up -d postgres redis backend
```

2. **Используйте внешний PostgreSQL** (если есть возможность):
   - beget.com предоставляет управляемые БД
   - Это снизит нагрузку на ваш контейнер

3. **Настройте логирование**:
```bash
docker-compose logs --tail=100 > logs.txt
```

4. **Регулярно проверяйте состояние**:
```bash
# Добавьте в cron
0 * * * * cd /path/to/project && ./docker-diagnose.sh >> /var/log/docker-check.log
```

### Получение помощи

Если проблема не решена:

1. Запустите скрипт диагностики и сохраните вывод:
```bash
./docker-diagnose.sh > diagnose-output.txt
```

2. Соберите логи всех сервисов:
```bash
docker-compose logs > full-logs.txt
```

3. Проверьте системные логи сервера (если есть доступ):
```bash
dmesg | tail -100
journalctl -xe | tail -100
```

### Контакты и ресурсы

- Документация Docker: https://docs.docker.com/
- Документация PostgreSQL: https://www.postgresql.org/docs/
- Поддержка beget.com: https://beget.com/ru/kb
