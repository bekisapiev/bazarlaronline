-- =====================================================================
-- Скрипт 1: Создание всех таблиц базы данных Bazarlar Online
-- =====================================================================
-- Описание: DDL скрипт для создания полной схемы базы данных
-- Запуск: docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/001_create_tables.sql
-- =====================================================================

BEGIN;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'СОЗДАНИЕ СХЕМЫ БАЗЫ ДАННЫХ';
    RAISE NOTICE '========================================';
END $$;

-- Включаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    RAISE NOTICE '✓ Расширения PostgreSQL активированы';
END $$;

-- =====================================================================
-- 1. СПРАВОЧНЫЕ ТАБЛИЦЫ (REFERENCE DATA)
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание справочных таблиц...';
END $$;

-- Таблица: cities (Города)
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100),
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_sort_order ON cities(sort_order);

-- Таблица: markets (Рынки)
CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8)
);

CREATE INDEX IF NOT EXISTS idx_markets_city_id ON markets(city_id);

-- Таблица: categories (Категории товаров/услуг)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

DO $$ BEGIN
    RAISE NOTICE '✓ Справочные таблицы созданы';
END $$;

-- =====================================================================
-- 2. ПОЛЬЗОВАТЕЛИ И ПРОФИЛИ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблиц пользователей...';
END $$;

-- Таблица: users (Пользователи)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    referral_id VARCHAR(20) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'seller', 'moderator', 'admin', 'cashier')),
    tariff VARCHAR(20) DEFAULT 'free' NOT NULL CHECK (tariff IN ('free', 'pro', 'business')),
    tariff_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_id ON users(referral_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Таблица: seller_profiles (Профили продавцов)
CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    description TEXT,
    banner_url VARCHAR(500),
    logo_url VARCHAR(500),
    category_id INTEGER REFERENCES categories(id),
    city_id INTEGER REFERENCES cities(id),
    seller_type VARCHAR(50) CHECK (seller_type IN ('market', 'boutique', 'shop', 'office', 'home', 'mobile', 'warehouse')),
    market_id INTEGER REFERENCES markets(id),
    address TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_city_id ON seller_profiles(city_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_category_id ON seller_profiles(category_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_rating ON seller_profiles(rating);

-- Таблица: wallets (Кошельки пользователей)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    main_balance NUMERIC(10, 2) DEFAULT 0 CHECK (main_balance >= 0),
    referral_balance NUMERIC(10, 2) DEFAULT 0 CHECK (referral_balance >= 0),
    currency VARCHAR(3) DEFAULT 'KGS',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблицы пользователей созданы';
END $$;

-- =====================================================================
-- 3. ТОВАРЫ И УСЛУГИ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблиц товаров и услуг...';
END $$;

-- Таблица: products (Товары и услуги)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_type VARCHAR(20) DEFAULT 'product' NOT NULL CHECK (product_type IN ('product', 'service')),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price >= 0),
    partner_percent NUMERIC(5, 2) DEFAULT 0 CHECK (partner_percent >= 0 AND partner_percent <= 100),
    delivery_type VARCHAR(20) CHECK (delivery_type IN ('pickup', 'paid', 'free')),
    delivery_methods JSONB,
    characteristics JSONB,
    images JSONB,
    status VARCHAR(20) DEFAULT 'moderation' CHECK (status IN ('moderation', 'active', 'inactive', 'rejected')),
    moderation_result JSONB,
    is_promoted BOOLEAN DEFAULT false,
    promoted_at TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_promoted ON products(is_promoted);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблицы товаров и услуг созданы';
END $$;

-- =====================================================================
-- 4. ЗАКАЗЫ И ЗАПИСИ НА УСЛУГИ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблиц заказов и записей...';
END $$;

-- Таблица: orders (Заказы товаров)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    delivery_address TEXT,
    phone_number VARCHAR(20),
    payment_method VARCHAR(20) CHECK (payment_method IN ('wallet', 'mbank', 'cash')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    referral_id UUID REFERENCES users(id),
    referral_commission NUMERIC(10, 2),
    platform_commission NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Таблица: bookings (Записи на услуги)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    booking_datetime TIMESTAMP NOT NULL,
    comment TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seller_id ON bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_buyer_id ON bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_datetime ON bookings(booking_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_seller_datetime ON bookings(seller_id, booking_datetime) WHERE status IN ('pending', 'confirmed');

DO $$ BEGIN
    RAISE NOTICE '✓ Таблицы заказов и записей созданы';
END $$;

-- =====================================================================
-- 5. ОТЗЫВЫ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблицы отзывов...';
END $$;

-- Таблица: reviews (Отзывы на товары и услуги)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    booking_id UUID REFERENCES bookings(id),
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 10),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_order_or_booking CHECK (
        (order_id IS NOT NULL AND booking_id IS NULL) OR
        (order_id IS NULL AND booking_id IS NOT NULL)
    ),
    CONSTRAINT unique_review_per_order UNIQUE (order_id, buyer_id),
    CONSTRAINT unique_review_per_booking UNIQUE (booking_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблица отзывов создана';
END $$;

-- =====================================================================
-- 6. ТРАНЗАКЦИИ И ВЫВОД СРЕДСТВ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблиц транзакций...';
END $$;

-- Таблица: transactions (Транзакции)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('topup', 'withdrawal', 'purchase', 'referral', 'promotion', 'refund')),
    amount NUMERIC(10, 2) NOT NULL,
    balance_type VARCHAR(20) CHECK (balance_type IN ('main', 'referral')),
    description TEXT,
    reference_id UUID,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Таблица: withdrawal_requests (Заявки на вывод средств)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    method VARCHAR(20) DEFAULT 'mbank',
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблицы транзакций созданы';
END $$;

-- =====================================================================
-- 7. ЧАТЫ И СООБЩЕНИЯ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблиц чатов...';
END $$;

-- Таблица: chats (Чаты)
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES users(id),
    participant2_id UUID NOT NULL REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_chat UNIQUE (participant1_id, participant2_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_chats_participant1_id ON chats(participant1_id);
CREATE INDEX IF NOT EXISTS idx_chats_participant2_id ON chats(participant2_id);
CREATE INDEX IF NOT EXISTS idx_chats_product_id ON chats(product_id);

-- Таблица: messages (Сообщения)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблицы чатов созданы';
END $$;

-- =====================================================================
-- 8. УВЕДОМЛЕНИЯ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблицы уведомлений...';
END $$;

-- Таблица: notifications (Уведомления)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('order', 'review', 'moderation', 'system', 'wallet', 'chat')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблица уведомлений создана';
END $$;

-- =====================================================================
-- 9. ИЗБРАННОЕ И ИСТОРИЯ ПРОСМОТРОВ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблиц избранного...';
END $$;

-- Таблица: favorites (Избранные товары)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_product_favorite UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Таблица: view_history (История просмотров)
CREATE TABLE IF NOT EXISTS view_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_view_history_user_id ON view_history(user_id);
CREATE INDEX IF NOT EXISTS idx_view_history_product_id ON view_history(product_id);
CREATE INDEX IF NOT EXISTS idx_view_history_viewed_at ON view_history(viewed_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблицы избранного созданы';
END $$;

-- =====================================================================
-- 10. АВТОПРОДВИЖЕНИЕ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблицы автопродвижения...';
END $$;

-- Таблица: auto_promotions (Автоматическое продвижение)
CREATE TABLE IF NOT EXISTS auto_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    frequency_minutes INTEGER NOT NULL CHECK (frequency_minutes >= 30),
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_promoted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_promotions_product_id ON auto_promotions(product_id);
CREATE INDEX IF NOT EXISTS idx_auto_promotions_is_active ON auto_promotions(is_active);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблица автопродвижения создана';
END $$;

-- =====================================================================
-- 11. ЖАЛОБЫ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблицы жалоб...';
END $$;

-- Enum types for reports
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status_enum') THEN
        CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type_enum') THEN
        CREATE TYPE report_type_enum AS ENUM ('product', 'seller', 'review', 'user');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason_enum') THEN
        CREATE TYPE report_reason_enum AS ENUM ('spam', 'inappropriate', 'fraud', 'fake', 'copyright', 'offensive', 'other');
    END IF;
END$$;

-- Таблица: reports (Жалобы)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type report_type_enum NOT NULL,
    reported_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reported_seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason report_reason_enum NOT NULL,
    description TEXT NOT NULL,
    status report_status_enum DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблица жалоб создана';
END $$;

-- =====================================================================
-- 12. КУПОНЫ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Создание таблиц купонов...';
END $$;

-- Enum type for coupons
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_type_enum') THEN
        CREATE TYPE coupon_type_enum AS ENUM ('percentage', 'fixed');
    END IF;
END$$;

-- Таблица: coupons (Купоны/Промокоды)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type coupon_type_enum NOT NULL,
    value INTEGER NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    min_order_amount INTEGER,
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_seller_id ON coupons(seller_id);

-- Таблица: coupon_usage (История использования купонов)
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount INTEGER NOT NULL,
    used_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_used_at ON coupon_usage(used_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Таблицы купонов созданы';
END $$;

COMMIT;

-- =====================================================================
-- ИТОГОВАЯ СТАТИСТИКА
-- =====================================================================

DO $$
DECLARE
    tables_count INT;
    indexes_count INT;
BEGIN
    SELECT COUNT(*) INTO tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO indexes_count
    FROM pg_indexes
    WHERE schemaname = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'СХЕМА БАЗЫ ДАННЫХ СОЗДАНА!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Создано таблиц: %', tables_count;
    RAISE NOTICE 'Создано индексов: %', indexes_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Список таблиц:';
    RAISE NOTICE '  1. cities - Города';
    RAISE NOTICE '  2. markets - Рынки';
    RAISE NOTICE '  3. categories - Категории';
    RAISE NOTICE '  4. users - Пользователи';
    RAISE NOTICE '  5. seller_profiles - Профили продавцов';
    RAISE NOTICE '  6. wallets - Кошельки';
    RAISE NOTICE '  7. products - Товары и услуги';
    RAISE NOTICE '  8. orders - Заказы товаров';
    RAISE NOTICE '  9. bookings - Записи на услуги';
    RAISE NOTICE ' 10. reviews - Отзывы';
    RAISE NOTICE ' 11. transactions - Транзакции';
    RAISE NOTICE ' 12. withdrawal_requests - Заявки на вывод';
    RAISE NOTICE ' 13. chats - Чаты';
    RAISE NOTICE ' 14. messages - Сообщения';
    RAISE NOTICE ' 15. notifications - Уведомления';
    RAISE NOTICE ' 16. favorites - Избранное';
    RAISE NOTICE ' 17. view_history - История просмотров';
    RAISE NOTICE ' 18. auto_promotions - Автопродвижение';
    RAISE NOTICE ' 19. reports - Жалобы';
    RAISE NOTICE ' 20. coupons - Купоны';
    RAISE NOTICE ' 21. coupon_usage - Использование купонов';
    RAISE NOTICE '========================================';
END $$;
