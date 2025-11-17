-- ============================================================================
-- Bazarlar Online - Полная инициализация базы данных
-- Версия: 1.0
-- Описание: Создание всех таблиц и загрузка тестовых данных
-- ============================================================================

-- Установка кодировки для правильного отображения кириллицы
SET client_encoding = 'UTF8';

-- Удаляем существующие таблицы (если есть) - ВНИМАНИЕ: удаляет все данные!
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS auto_promotions CASCADE;
DROP TABLE IF EXISTS view_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS seller_profiles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS markets CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаляем типы enum
DROP TYPE IF EXISTS report_reason CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS coupon_type CASCADE;

-- ============================================================================
-- РАСШИРЕНИЯ
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Для полнотекстового поиска

-- ============================================================================
-- ТИПЫ ENUM
-- ============================================================================

CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE report_type AS ENUM ('product', 'seller', 'review', 'user');
CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'fraud', 'fake', 'copyright', 'offensive', 'other');

-- ============================================================================
-- ТАБЛИЦЫ
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ПОЛЬЗОВАТЕЛИ
-- ----------------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    referral_id VARCHAR(20) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    tariff VARCHAR(20) DEFAULT 'free' NOT NULL,
    tariff_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    ban_reason TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_referral_id ON users(referral_id);

-- ----------------------------------------------------------------------------
-- 2. ГОРОДА
-- ----------------------------------------------------------------------------

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100),
    sort_order INTEGER DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 3. РЫНКИ
-- ----------------------------------------------------------------------------

CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8)
);

CREATE INDEX idx_markets_city_id ON markets(city_id);

-- ----------------------------------------------------------------------------
-- 4. КАТЕГОРИИ
-- ----------------------------------------------------------------------------

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    level INTEGER NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ----------------------------------------------------------------------------
-- 5. ПРОФИЛИ ПРОДАВЦОВ
-- ----------------------------------------------------------------------------

CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    description TEXT,
    banner_url VARCHAR(500),
    logo_url VARCHAR(500),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
    seller_type VARCHAR(50),
    market_id INTEGER REFERENCES markets(id) ON DELETE SET NULL,
    address TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_city_id ON seller_profiles(city_id);
CREATE INDEX idx_seller_profiles_rating ON seller_profiles(rating);

-- ----------------------------------------------------------------------------
-- 6. КОШЕЛЬКИ
-- ----------------------------------------------------------------------------

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    main_balance NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    referral_balance NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    currency VARCHAR(3) DEFAULT 'KGS' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- ----------------------------------------------------------------------------
-- 7. ТОВАРЫ
-- ----------------------------------------------------------------------------

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    partner_percent NUMERIC(5, 2) DEFAULT 0,
    delivery_type VARCHAR(20),
    delivery_methods JSONB,
    characteristics JSONB,
    images JSONB,
    status VARCHAR(20) DEFAULT 'moderation' NOT NULL,
    moderation_result JSONB,
    is_promoted BOOLEAN DEFAULT FALSE,
    promoted_at TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT check_partner_percent CHECK (partner_percent >= 0 AND partner_percent <= 100)
);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_is_promoted ON products(is_promoted);

-- ----------------------------------------------------------------------------
-- 8. ЗАКАЗЫ
-- ----------------------------------------------------------------------------

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    delivery_address TEXT,
    phone_number VARCHAR(20),
    payment_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    referral_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_commission NUMERIC(10, 2),
    platform_commission NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ----------------------------------------------------------------------------
-- 9. ОТЗЫВЫ
-- ----------------------------------------------------------------------------

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT check_rating CHECK (rating >= 0 AND rating <= 10),
    CONSTRAINT unique_review_per_order UNIQUE (order_id, buyer_id)
);

CREATE INDEX idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);

-- ----------------------------------------------------------------------------
-- 10. ТРАНЗАКЦИИ
-- ----------------------------------------------------------------------------

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    balance_type VARCHAR(20),
    description TEXT,
    reference_id UUID,
    status VARCHAR(20) DEFAULT 'completed' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ----------------------------------------------------------------------------
-- 11. ЗАЯВКИ НА ВЫВОД СРЕДСТВ
-- ----------------------------------------------------------------------------

CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(20) DEFAULT 'mbank' NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);

-- ----------------------------------------------------------------------------
-- 12. УВЕДОМЛЕНИЯ
-- ----------------------------------------------------------------------------

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ----------------------------------------------------------------------------
-- 13. ИЗБРАННОЕ
-- ----------------------------------------------------------------------------

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_product_favorite UNIQUE (user_id, product_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- ----------------------------------------------------------------------------
-- 14. ИСТОРИЯ ПРОСМОТРОВ
-- ----------------------------------------------------------------------------

CREATE TABLE view_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_view_history_user_id ON view_history(user_id);
CREATE INDEX idx_view_history_product_id ON view_history(product_id);
CREATE INDEX idx_view_history_viewed_at ON view_history(viewed_at);

-- ----------------------------------------------------------------------------
-- 15. АВТОПРОДВИЖЕНИЕ
-- ----------------------------------------------------------------------------

CREATE TABLE auto_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    frequency_minutes INTEGER NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_promoted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT check_frequency_minutes CHECK (frequency_minutes >= 30)
);

CREATE INDEX idx_auto_promotions_product_id ON auto_promotions(product_id);

-- ----------------------------------------------------------------------------
-- 16. ЧАТЫ
-- ----------------------------------------------------------------------------

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_chat UNIQUE (participant1_id, participant2_id, product_id)
);

CREATE INDEX idx_chats_participant1_id ON chats(participant1_id);
CREATE INDEX idx_chats_participant2_id ON chats(participant2_id);

-- ----------------------------------------------------------------------------
-- 17. СООБЩЕНИЯ
-- ----------------------------------------------------------------------------

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ----------------------------------------------------------------------------
-- 18. КУПОНЫ
-- ----------------------------------------------------------------------------

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type coupon_type NOT NULL,
    value INTEGER NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    min_order_amount INTEGER,
    valid_from TIMESTAMP DEFAULT NOW() NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_seller_id ON coupons(seller_id);

-- ----------------------------------------------------------------------------
-- 19. ИСПОЛЬЗОВАНИЕ КУПОНОВ
-- ----------------------------------------------------------------------------

CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount INTEGER NOT NULL,
    used_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_used_at ON coupon_usage(used_at);

-- ----------------------------------------------------------------------------
-- 20. ЖАЛОБЫ
-- ----------------------------------------------------------------------------

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    reported_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reported_seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    description TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- ============================================================================
-- ФУНКЦИИ
-- ============================================================================

-- Функция для генерации referral_id
CREATE OR REPLACE FUNCTION generate_referral_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ГОРОДА
-- ----------------------------------------------------------------------------

INSERT INTO cities (id, name, slug, region) VALUES
(1, 'Бишкек', 'bishkek', 'Чуйская область'),
(2, 'Ош', 'osh', 'Ошская область'),
(3, 'Джалал-Абад', 'jalal-abad', 'Джалал-Абадская область'),
(4, 'Каракол', 'karakol', 'Иссык-Кульская область'),
(5, 'Токмок', 'tokmok', 'Чуйская область');

-- ----------------------------------------------------------------------------
-- РЫНКИ
-- ----------------------------------------------------------------------------

INSERT INTO markets (id, city_id, name, address, latitude, longitude) VALUES
(1, 1, 'Дордой', 'ул. Шабдан Баатыра', 42.8924, 74.6340),
(2, 1, 'Ошский рынок', 'ул. Киевская', 42.8746, 74.6122),
(3, 1, 'Ортосайский рынок', 'ул. Ахунбаева', 42.8544, 74.6206),
(4, 1, 'Аламединский рынок', 'ул. Ибраимова', 42.8489, 74.5899),
(5, 1, 'Ак-Эмир', 'ул. Горького', 42.8704, 74.5946),
(6, 2, 'Жайма', 'Ошский базар', NULL, NULL),
(7, 2, 'Кара-Суу', 'Кара-Суйский рынок', NULL, NULL);

-- ----------------------------------------------------------------------------
-- КАТЕГОРИИ
-- ----------------------------------------------------------------------------

-- Категории уровня 1
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(1, NULL, 'Одежда', 'clothing', 1, '👕', 1, true),
(2, NULL, 'Обувь', 'shoes', 1, '👟', 2, true),
(3, NULL, 'Электроника', 'electronics', 1, '📱', 3, true),
(4, NULL, 'Продукты питания', 'food', 1, '🍎', 4, true),
(5, NULL, 'Товары для дома', 'home', 1, '🏠', 5, true),
(6, NULL, 'Косметика', 'beauty', 1, '💄', 6, true),
(7, NULL, 'Детские товары', 'kids', 1, '🧸', 7, true),
(8, NULL, 'Спорт', 'sport', 1, '⚽', 8, true);

-- Категории уровня 2 (Одежда)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active) VALUES
(11, 1, 'Мужская одежда', 'men-clothing', 2, 1, true),
(12, 1, 'Женская одежда', 'women-clothing', 2, 2, true),
(13, 1, 'Верхняя одежда', 'outerwear', 2, 3, true),
(14, 1, 'Аксессуары', 'accessories', 2, 4, true);

-- Категории уровня 2 (Электроника)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active) VALUES
(31, 3, 'Смартфоны', 'smartphones', 2, 1, true),
(32, 3, 'Ноутбуки', 'laptops', 2, 2, true),
(33, 3, 'Бытовая техника', 'appliances', 2, 3, true),
(34, 3, 'Аудио', 'audio', 2, 4, true);

-- Категории уровня 3 (Смартфоны)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active) VALUES
(311, 31, 'iPhone', 'iphone', 3, 1, true),
(312, 31, 'Samsung', 'samsung', 3, 2, true),
(313, 31, 'Xiaomi', 'xiaomi', 3, 3, true),
(314, 31, 'Другие бренды', 'other-phones', 3, 4, true);

-- ----------------------------------------------------------------------------
-- ПОЛЬЗОВАТЕЛИ
-- ----------------------------------------------------------------------------

-- Админ
INSERT INTO users (id, email, full_name, role, tariff, referral_id, created_at, is_banned)
VALUES (
    uuid_generate_v4(),
    'admin@bazarlar.online',
    'Администратор',
    'admin',
    'business',
    generate_referral_id(),
    NOW(),
    false
);

-- Тестовый продавец
INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
VALUES (
    uuid_generate_v4(),
    'seller@bazarlar.online',
    'Тестовый Продавец',
    '+996555123456',
    'seller',
    'pro',
    generate_referral_id(),
    NOW(),
    false
);

-- Дополнительные тестовые продавцы
INSERT INTO users (email, full_name, phone, role, tariff, referral_id, is_banned) VALUES
('seller1@test.com', 'Айгуль Асанова', '+996555111111', 'seller', 'pro', generate_referral_id(), false),
('seller2@test.com', 'Тимур Бекмуратов', '+996555222222', 'seller', 'business', generate_referral_id(), false),
('seller3@test.com', 'Нургуль Токтогулова', '+996555333333', 'seller', 'free', generate_referral_id(), false),
('seller4@test.com', 'Эрлан Шаршеев', '+996555444444', 'seller', 'pro', generate_referral_id(), false),
('seller5@test.com', 'Жанара Исакова', '+996555555555', 'seller', 'business', generate_referral_id(), false),
('seller6@test.com', 'Назира Абдиева', '+996555666666', 'seller', 'pro', generate_referral_id(), false),
('seller7@test.com', 'Азамат Мураталиев', '+996555777777', 'seller', 'free', generate_referral_id(), false),
('seller8@test.com', 'Гулнара Сыдыкова', '+996555888888', 'seller', 'pro', generate_referral_id(), false),
('seller9@test.com', 'Бактыгуль Жумабаева', '+996555999999', 'seller', 'business', generate_referral_id(), false),
('seller10@test.com', 'Эмир Алиев', '+996555000000', 'seller', 'pro', generate_referral_id(), false);

-- ----------------------------------------------------------------------------
-- ПРОФИЛИ ПРОДАВЦОВ
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    admin_user_id UUID;
    seller_user_id UUID;
    seller1_id UUID;
    seller2_id UUID;
    seller3_id UUID;
    seller4_id UUID;
    seller5_id UUID;
    seller6_id UUID;
    seller7_id UUID;
    seller8_id UUID;
    seller9_id UUID;
    seller10_id UUID;
BEGIN
    -- Получаем ID пользователей
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@bazarlar.online';
    SELECT id INTO seller_user_id FROM users WHERE email = 'seller@bazarlar.online';
    SELECT id INTO seller1_id FROM users WHERE email = 'seller1@test.com';
    SELECT id INTO seller2_id FROM users WHERE email = 'seller2@test.com';
    SELECT id INTO seller3_id FROM users WHERE email = 'seller3@test.com';
    SELECT id INTO seller4_id FROM users WHERE email = 'seller4@test.com';
    SELECT id INTO seller5_id FROM users WHERE email = 'seller5@test.com';
    SELECT id INTO seller6_id FROM users WHERE email = 'seller6@test.com';
    SELECT id INTO seller7_id FROM users WHERE email = 'seller7@test.com';
    SELECT id INTO seller8_id FROM users WHERE email = 'seller8@test.com';
    SELECT id INTO seller9_id FROM users WHERE email = 'seller9@test.com';
    SELECT id INTO seller10_id FROM users WHERE email = 'seller10@test.com';

    -- Профиль админа
    INSERT INTO seller_profiles (user_id, shop_name, description, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (admin_user_id, 'Premium Store', 'Магазин администратора с бизнес-тарифом', 1, 'shop', 'ул. Киевская 123, офис 1', 5.0, 500, true);

    -- Профиль тестового продавца
    INSERT INTO seller_profiles (user_id, shop_name, description, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller_user_id, 'Pro Seller Shop', 'Тестовый магазин продавца с PRO-тарифом', 1, 'market', 1, 'Дордой, контейнер 100', 4.9, 350, true);

    -- Профили дополнительных продавцов
    INSERT INTO seller_profiles (user_id, shop_name, description, city_id, seller_type, market_id, address, rating, reviews_count, is_verified) VALUES
    (seller1_id, 'Модный стиль', 'Женская и мужская одежда высокого качества', 1, 'market', 1, 'Дордой, контейнер 456', 4.8, 127, true),
    (seller2_id, 'TechnoShop', 'Смартфоны, ноутбуки, аксессуары', 1, 'boutique', NULL, 'ул. Чуй 156', 4.9, 245, true),
    (seller3_id, 'Фермерские продукты', 'Свежие овощи, фрукты, молочные продукты', 1, 'market', 2, 'Ошский рынок, ряд 3', 4.5, 89, true),
    (seller4_id, 'Обувной мир', 'Турецкая и итальянская обувь', 1, 'shop', NULL, 'ТЦ Вефа, 2 этаж', 4.7, 156, true),
    (seller5_id, 'BeautyKG', 'Корейская и европейская косметика', 1, 'office', NULL, 'ул. Токтогула 123, офис 45', 4.9, 312, true),
    (seller6_id, 'Детский рай', 'Игрушки, одежда, коляски', 1, 'shop', NULL, 'ТЦ Дордой Плаза', 4.6, 198, true),
    (seller7_id, 'Спорт Лайф', 'Спортивная одежда и инвентарь', 1, 'mobile', NULL, 'Доставка по всему городу', 4.3, 67, false),
    (seller8_id, 'Уют и комфорт', 'Текстиль, посуда, декор', 2, 'market', 6, 'Рынок Жайма, секция Б', 4.7, 134, true),
    (seller9_id, 'Silk Road Fashion', 'Традиционная и современная одежда', 2, 'boutique', NULL, 'ул. Ленина 78', 4.8, 201, true),
    (seller10_id, 'Gadget Store', 'Гаджеты и аксессуары', 3, 'shop', NULL, 'Центральный рынок', 4.5, 92, true);

    -- Создаем кошельки для всех пользователей
    INSERT INTO wallets (user_id, main_balance, referral_balance)
    SELECT id, 0, 0 FROM users;

    -- ----------------------------------------------------------------------------
    -- ТОВАРЫ
    -- ----------------------------------------------------------------------------

    -- Товары продавца 1 (Одежда)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller1_id, 'Мужская футболка polo', 'Качественная хлопковая футболка с воротником polo', 11, 1200, 999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"M, L, XL"},{"name":"Цвет","value":"Белый, Черный, Синий"},{"name":"Материал","value":"100% хлопок"}]', '["https://placehold.co/600x400/4A90E2/FFF?text=Polo+Shirt"]', 'active', 145),
    (seller1_id, 'Женское платье летнее', 'Легкое летнее платье из натуральной ткани', 12, 2500, 1999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"S, M, L"},{"name":"Цвет","value":"Розовый, Голубой"},{"name":"Материал","value":"Лен"}]', '["https://placehold.co/600x400/FF6B9D/FFF?text=Summer+Dress"]', 'active', 238),
    (seller1_id, 'Джинсы мужские классические', 'Плотные джинсы прямого кроя', 11, 3500, 2999, 'paid', '["taxi"]', '[{"name":"Размер","value":"30-36"},{"name":"Цвет","value":"Синий, Черный"}]', '["https://placehold.co/600x400/2C3E50/FFF?text=Jeans"]', 'active', 189),
    (seller1_id, 'Зимняя куртка', 'Теплая зимняя куртка с капюшоном', 13, 5500, 4999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"M, L, XL, XXL"},{"name":"Цвет","value":"Черный, Темно-синий"}]', '["https://placehold.co/600x400/34495E/FFF?text=Winter+Jacket"]', 'active', 276),
    (seller1_id, 'Шарф кашемировый', 'Мягкий кашемировый шарф', 14, 1800, NULL, 'paid', '["taxi"]', '[{"name":"Цвет","value":"Бежевый, Серый, Бордовый"}]', '["https://placehold.co/600x400/95A5A6/FFF?text=Scarf"]', 'active', 92);

    -- Товары продавца 2 (Электроника)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller2_id, 'iPhone 15 Pro 256GB', 'Новый iPhone 15 Pro с титановым корпусом', 311, 85000, 82000, 'free', '["express", "courier"]', '[{"name":"Память","value":"256GB"},{"name":"Цвет","value":"Титан"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/000000/FFF?text=iPhone+15+Pro"]', 'active', 512),
    (seller2_id, 'Samsung Galaxy S24 Ultra', 'Флагманский смартфон Samsung с S Pen', 312, 75000, 72000, 'free', '["express", "courier"]', '[{"name":"Память","value":"512GB"},{"name":"Цвет","value":"Черный"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/1428A0/FFF?text=Galaxy+S24"]', 'active', 445),
    (seller2_id, 'Xiaomi Redmi Note 13 Pro', 'Смартфон с отличной камерой', 313, 22000, 19999, 'free', '["express", "courier"]', '[{"name":"Память","value":"256GB"},{"name":"Цвет","value":"Синий, Черный"}]', '["https://placehold.co/600x400/FF6900/FFF?text=Redmi+Note"]', 'active', 678),
    (seller2_id, 'MacBook Pro 14 M3', 'Ноутбук для профессионалов', 32, 120000, 115000, 'free', '["courier"]', '[{"name":"Процессор","value":"Apple M3"},{"name":"Память","value":"16GB RAM, 512GB SSD"},{"name":"Цвет","value":"Space Gray"}]', '["https://placehold.co/600x400/A2AAAD/FFF?text=MacBook+Pro"]', 'active', 389),
    (seller2_id, 'AirPods Pro 2', 'Беспроводные наушники с шумоподавлением', 34, 18000, 16999, 'free', '["express", "courier"]', '[{"name":"Особенности","value":"ANC, Прозрачный режим"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/FFFFFF/000?text=AirPods+Pro"]', 'active', 234);

    -- Товары продавца 3 (Продукты)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller3_id, 'Молоко домашнее 1л', 'Свежее коровье молоко от фермеров', 4, 80, NULL, 'pickup', '[]', '[{"name":"Объем","value":"1 литр"},{"name":"Жирность","value":"3.2%"}]', '["https://placehold.co/600x400/FFFFFF/000?text=Milk"]', 'active', 567),
    (seller3_id, 'Яйца куриные 10 шт', 'Свежие домашние яйца', 4, 120, 100, 'pickup', '[]', '[{"name":"Количество","value":"10 штук"},{"name":"Категория","value":"С1"}]', '["https://placehold.co/600x400/F4E4C1/000?text=Eggs"]', 'active', 423),
    (seller3_id, 'Помидоры свежие 1кг', 'Свежие тепличные помидоры', 4, 150, NULL, 'pickup', '["taxi"]', '[{"name":"Вес","value":"1 кг"}]', '["https://placehold.co/600x400/FF6347/FFF?text=Tomatoes"]', 'active', 312),
    (seller3_id, 'Огурцы 1кг', 'Свежие хрустящие огурцы', 4, 100, 90, 'pickup', '["taxi"]', '[{"name":"Вес","value":"1 кг"}]', '["https://placehold.co/600x400/90EE90/000?text=Cucumbers"]', 'active', 289);

    -- Товары продавца 4 (Обувь)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller4_id, 'Кроссовки Nike Air Max', 'Спортивные кроссовки для бега', 2, 6500, 5999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"39-45"},{"name":"Цвет","value":"Черный, Белый"},{"name":"Материал","value":"Текстиль, резина"}]', '["https://placehold.co/600x400/000000/FFF?text=Nike+Air+Max"]', 'active', 445),
    (seller4_id, 'Туфли женские классические', 'Элегантные туфли на каблуке', 2, 3500, 2999, 'paid', '["taxi"]', '[{"name":"Размер","value":"36-40"},{"name":"Цвет","value":"Черный, Бежевый"},{"name":"Высота каблука","value":"7см"}]', '["https://placehold.co/600x400/000000/FFF?text=Heels"]', 'active', 334),
    (seller4_id, 'Ботинки зимние мужские', 'Теплые зимние ботинки', 2, 4500, 3999, 'paid', '["taxi"]', '[{"name":"Размер","value":"40-46"},{"name":"Цвет","value":"Черный, Коричневый"}]', '["https://placehold.co/600x400/8B4513/FFF?text=Winter+Boots"]', 'active', 267);

    -- Товары продавца 5 (Косметика)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller5_id, 'Тональный крем Estee Lauder', 'Стойкий тональный крем 24 часа', 6, 3500, 3199, 'free', '["express", "courier"]', '[{"name":"Оттенок","value":"Ivory, Beige, Tan"},{"name":"Объем","value":"30ml"}]', '["https://placehold.co/600x400/FFE4B5/000?text=Foundation"]', 'active', 523),
    (seller5_id, 'Корейская тканевая маска набор 10шт', 'Увлажняющие маски для лица', 6, 800, 699, 'paid', '["taxi", "express"]', '[{"name":"Тип","value":"Увлажняющая"},{"name":"Количество","value":"10 штук"}]', '["https://placehold.co/600x400/FFB6C1/000?text=Face+Masks"]', 'active', 678),
    (seller5_id, 'Помада MAC матовая', 'Стойкая матовая помада', 6, 2200, 1999, 'paid', '["express"]', '[{"name":"Оттенок","value":"Red, Pink, Nude"}]', '["https://placehold.co/600x400/DC143C/FFF?text=Lipstick"]', 'active', 445);

    -- Товары продавца 6 (Детские товары)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller6_id, 'Коляска прогулочная Babytime', 'Легкая прогулочная коляска', 7, 8500, 7999, 'paid', '["cargo"]', '[{"name":"Вес","value":"6.5 кг"},{"name":"Цвет","value":"Серый, Синий"}]', '["https://placehold.co/600x400/708090/FFF?text=Stroller"]', 'active', 234),
    (seller6_id, 'Конструктор LEGO Classic', 'Набор для творчества 500 деталей', 7, 3500, 2999, 'paid', '["taxi", "express"]', '[{"name":"Возраст","value":"4+"},{"name":"Детали","value":"500 шт"}]', '["https://placehold.co/600x400/FFD700/000?text=LEGO"]', 'active', 567),
    (seller6_id, 'Детский комбинезон зимний', 'Теплый зимний комбинезон', 7, 4500, 3999, 'paid', '["taxi"]', '[{"name":"Размер","value":"80-110см"},{"name":"Цвет","value":"Синий, Розовый"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Overalls"]', 'active', 345);

    -- Товары продавца 7 (Спорт)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller7_id, 'Гантели разборные 20кг', 'Пара разборных гантелей', 8, 3500, NULL, 'paid', '["cargo"]', '[{"name":"Вес","value":"2x10 кг"}]', '["https://placehold.co/600x400/696969/FFF?text=Dumbbells"]', 'active', 178),
    (seller7_id, 'Коврик для йоги', 'Нескользящий коврик для занятий', 8, 1200, 999, 'paid', '["taxi"]', '[{"name":"Размер","value":"180x60см"},{"name":"Цвет","value":"Фиолетовый, Зеленый"}]', '["https://placehold.co/600x400/9370DB/FFF?text=Yoga+Mat"]', 'active', 234),
    (seller7_id, 'Скакалка профессиональная', 'Скакалка для кроссфита', 8, 600, 499, 'paid', '["taxi"]', '[{"name":"Длина","value":"3 метра"}]', '["https://placehold.co/600x400/FF4500/FFF?text=Jump+Rope"]', 'active', 145);

    -- Товары продавца 8 (Товары для дома - Ош)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller8_id, 'Постельное белье сатин', 'Комплект постельного белья 2-спальный', 5, 2500, 2199, 'paid', '["taxi"]', '[{"name":"Размер","value":"2-спальный"},{"name":"Материал","value":"Сатин"}]', '["https://placehold.co/600x400/E6E6FA/000?text=Bedding"]', 'active', 267),
    (seller8_id, 'Набор полотенец 3шт', 'Махровые полотенца', 5, 1200, 999, 'paid', '["taxi"]', '[{"name":"Размер","value":"50x90, 70x140"},{"name":"Цвет","value":"Белый, Бежевый"}]', '["https://placehold.co/600x400/F5F5DC/000?text=Towels"]', 'active', 189),
    (seller8_id, 'Шторы блэкаут', 'Светонепроницаемые шторы', 5, 3500, 2999, 'paid', '["cargo"]', '[{"name":"Размер","value":"270x280см"},{"name":"Цвет","value":"Серый, Бежевый"}]', '["https://placehold.co/600x400/808080/FFF?text=Curtains"]', 'active', 234);

    -- Товары продавца 9 (Одежда - Ош)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller9_id, 'Национальное платье элечек', 'Традиционное кыргызское платье', 12, 4500, NULL, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"S, M, L"},{"name":"Цвет","value":"Красный, Синий"}]', '["https://placehold.co/600x400/DC143C/FFF?text=Traditional+Dress"]', 'active', 156),
    (seller9_id, 'Кыргызский калпак', 'Традиционный войлочный головной убор', 14, 1500, 1299, 'paid', '["taxi"]', '[{"name":"Размер","value":"56-60"}]', '["https://placehold.co/600x400/F0F8FF/000?text=Kalpak"]', 'active', 198);

    -- Товары продавца 10 (Электроника - Джалал-Абад)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count) VALUES
    (seller10_id, 'Наушники JBL Tune 500', 'Накладные наушники с отличным звуком', 34, 2500, 2199, 'paid', '["taxi", "express"]', '[{"name":"Цвет","value":"Черный, Белый"},{"name":"Тип","value":"Проводные"}]', '["https://placehold.co/600x400/000000/FFF?text=JBL+Headphones"]', 'active', 234),
    (seller10_id, 'Powerbank 20000mAh', 'Внешний аккумулятор быстрая зарядка', 34, 1800, 1499, 'paid', '["taxi", "express"]', '[{"name":"Емкость","value":"20000mAh"},{"name":"Порты","value":"USB-C, USB-A"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Powerbank"]', 'active', 312);

END $$;

-- ============================================================================
-- ЗАВЕРШЕНИЕ
-- ============================================================================

-- Сброс последовательностей для auto_increment полей
SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));
SELECT setval('markets_id_seq', (SELECT MAX(id) FROM markets));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

COMMIT;

-- Вывод статистики
SELECT 'Успешно создано:' as status;
SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as seller_profiles FROM seller_profiles;
SELECT COUNT(*) as products FROM products;
SELECT COUNT(*) as cities FROM cities;
SELECT COUNT(*) as markets FROM markets;
SELECT COUNT(*) as categories FROM categories;
SELECT COUNT(*) as wallets FROM wallets;
