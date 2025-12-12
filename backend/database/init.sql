-- =============================================================================
-- ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ BAZARLAR ONLINE
-- PostgreSQL 15+
-- =============================================================================
-- Этот скрипт автоматически выполняется при первом запуске контейнера
-- через docker-entrypoint-initdb.d
-- =============================================================================

\echo '=========================================='
\echo 'ИНИЦИАЛИЗАЦИЯ БД BAZARLAR ONLINE'
\echo 'PostgreSQL 15'
\echo '=========================================='

-- Создание необходимых расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Для полнотекстового поиска

\echo '✓ Расширения PostgreSQL активированы'
\echo ''
\echo 'Используйте следующие команды для загрузки данных:'
\echo ''
\echo '1. Создание схемы БД:'
\echo '   docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql'
\echo ''
\echo '2. Загрузка справочных данных:'
\echo '   docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/seed_data.sql'
\echo ''
\echo '3. Загрузка тестовых данных (опционально):'
\echo '   docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/test_data.sql'
\echo ''
\echo '=========================================='
