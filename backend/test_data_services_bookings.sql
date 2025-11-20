-- =====================================================================
-- Тестовые данные: Услуги и записи на услуги
-- =====================================================================
-- Создание: продавцов услуг, самих услуг, и записей клиентов
--
-- ЗАПУСК ТОЛЬКО ЧЕРЕЗ PSQL после основного скрипта create_test_data.sql:
-- docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/test_data_services_bookings.sql
-- =====================================================================

BEGIN;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'СОЗДАНИЕ УСЛУГ И ЗАПИСЕЙ';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================================
-- ПРОДАВЦЫ УСЛУГ
-- =====================================================================

DO $$
DECLARE
    service_seller1_id UUID := gen_random_uuid();
    service_seller2_id UUID := gen_random_uuid();
    service_seller3_id UUID := gen_random_uuid();
    service_seller4_id UUID := gen_random_uuid();

    service1_id UUID := gen_random_uuid();
    service2_id UUID := gen_random_uuid();
    service3_id UUID := gen_random_uuid();
    service4_id UUID := gen_random_uuid();
    service5_id UUID := gen_random_uuid();
    service6_id UUID := gen_random_uuid();
    service7_id UUID := gen_random_uuid();
    service8_id UUID := gen_random_uuid();

    buyer1_id UUID;
    buyer2_id UUID;
    buyer3_id UUID;

BEGIN
    RAISE NOTICE 'Создание продавцов услуг...';

    -- Продавец услуг 1: Парикмахер
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (service_seller1_id, 'hairdresser@test.com', 'Айжан Сапарова', '+996555111222', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING RETURNING id INTO service_seller1_id;

    IF service_seller1_id IS NULL THEN
        SELECT id INTO service_seller1_id FROM users WHERE email = 'hairdresser@test.com';
    END IF;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller1_id, 'Салон красоты "Стиль"', 'Профессиональные услуги парикмахера. Стрижки, окрашивание, укладки', 9, 1, 'office', 'ул. Чуй 120, офис 5', 4.9, 87, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец услуг 2: Репетитор
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (service_seller2_id, 'tutor@test.com', 'Асель Бекова', '+996555222333', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING RETURNING id INTO service_seller2_id;

    IF service_seller2_id IS NULL THEN
        SELECT id INTO service_seller2_id FROM users WHERE email = 'tutor@test.com';
    END IF;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller2_id, 'Репетитор по математике', 'Занятия по математике, физике. Подготовка к ОРТ', 9, 1, 'mobile', 'Выезд на дом', 5.0, 45, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец услуг 3: Мастер маникюра
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (service_seller3_id, 'nails@test.com', 'Гульмира Алиева', '+996555333444', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING RETURNING id INTO service_seller3_id;

    IF service_seller3_id IS NULL THEN
        SELECT id INTO service_seller3_id FROM users WHERE email = 'nails@test.com';
    END IF;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller3_id, 'Nail Studio "Жемчужина"', 'Маникюр, педикюр, наращивание ногтей', 9, 1, 'office', 'мкр. Джал, ТЦ Bishkek Park, 3 этаж', 4.8, 156, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец услуг 4: Массажист
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (service_seller4_id, 'massage@test.com', 'Талант Кадыров', '+996555444555', 'seller', 'free', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING RETURNING id INTO service_seller4_id;

    IF service_seller4_id IS NULL THEN
        SELECT id INTO service_seller4_id FROM users WHERE email = 'massage@test.com';
    END IF;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller4_id, 'Лечебный массаж', 'Классический, спортивный, антицеллюлитный массаж', 9, 1, 'mobile', 'Выезд на дом или в офисе', 4.7, 34, false)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE '✓ Создано 4 продавца услуг';

    -- =====================================================================
    -- УСЛУГИ
    -- =====================================================================

    RAISE NOTICE 'Создание услуг...';

    -- Услуги парикмахера
    INSERT INTO products (id, seller_id, product_type, title, description, category_id, price, discount_price, characteristics, images, status, views_count, created_at)
    VALUES
    (service1_id, service_seller1_id, 'service', 'Женская стрижка', 'Профессиональная женская стрижка любой сложности', 9, 800, 700, '[{"name":"Длительность","value":"60 минут"},{"name":"Мастер","value":"Айжан"}]', '["https://placehold.co/600x400/FF69B4/FFF?text=Haircut"]', 'active', 89, NOW()),
    (service2_id, service_seller1_id, 'service', 'Окрашивание волос', 'Окрашивание профессиональными красками', 9, 2500, 2200, '[{"name":"Длительность","value":"2-3 часа"},{"name":"Включено","value":"Укладка"}]', '["https://placehold.co/600x400/9370DB/FFF?text=Hair+Color"]', 'active', 123, NOW());

    -- Услуги репетитора
    INSERT INTO products (id, seller_id, product_type, title, description, category_id, price, discount_price, characteristics, images, status, views_count, created_at)
    VALUES
    (service3_id, service_seller2_id, 'service', 'Занятие по математике', 'Индивидуальное занятие по математике (60 минут)', 9, 600, 500, '[{"name":"Длительность","value":"60 минут"},{"name":"Формат","value":"Онлайн или офлайн"},{"name":"Уровень","value":"Школа, ОРТ"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Math+Lesson"]', 'active', 67, NOW()),
    (service4_id, service_seller2_id, 'service', 'Подготовка к ОРТ (пакет 10 занятий)', 'Комплексная подготовка к ОРТ по математике', 9, 5000, 4500, '[{"name":"Занятий","value":"10"},{"name":"Длительность","value":"60 минут каждое"}]', '["https://placehold.co/600x400/32CD32/FFF?text=ORT+Prep"]', 'active', 45, NOW());

    -- Услуги мастера маникюра
    INSERT INTO products (id, seller_id, product_type, title, description, category_id, price, discount_price, characteristics, images, status, views_count, created_at)
    VALUES
    (service5_id, service_seller3_id, 'service', 'Маникюр классический', 'Классический маникюр с покрытием гель-лак', 9, 500, NULL, '[{"name":"Длительность","value":"90 минут"},{"name":"Включено","value":"Покрытие гель-лак"}]', '["https://placehold.co/600x400/FF1493/FFF?text=Manicure"]', 'active', 178, NOW()),
    (service6_id, service_seller3_id, 'service', 'Педикюр аппаратный', 'Аппаратный педикюр с покрытием', 9, 700, 650, '[{"name":"Длительность","value":"120 минут"},{"name":"Тип","value":"Аппаратный"}]', '["https://placehold.co/600x400/FF69B4/FFF?text=Pedicure"]', 'active', 134, NOW());

    -- Услуги массажиста
    INSERT INTO products (id, seller_id, product_type, title, description, category_id, price, discount_price, characteristics, images, status, views_count, created_at)
    VALUES
    (service7_id, service_seller4_id, 'service', 'Классический массаж спины', 'Расслабляющий массаж спины и шеи', 9, 1000, 900, '[{"name":"Длительность","value":"60 минут"},{"name":"Зона","value":"Спина, шея"}]', '["https://placehold.co/600x400/87CEEB/FFF?text=Back+Massage"]', 'active', 56, NOW()),
    (service8_id, service_seller4_id, 'service', 'Антицеллюлитный массаж', 'Интенсивный антицеллюлитный массаж', 9, 1200, NULL, '[{"name":"Длительность","value":"90 минут"},{"name":"Зона","value":"Проблемные зоны"}]', '["https://placehold.co/600x400/FFA07A/FFF?text=Anti-cellulite"]', 'active', 43, NOW());

    RAISE NOTICE '✓ Создано 8 услуг';

    -- =====================================================================
    -- ЗАПИСИ НА УСЛУГИ (BOOKINGS)
    -- =====================================================================

    RAISE NOTICE 'Создание записей на услуги...';

    -- Получаем ID покупателей
    SELECT id INTO buyer1_id FROM users WHERE email = 'buyer1@test.com';
    SELECT id INTO buyer2_id FROM users WHERE email = 'buyer2@test.com';
    SELECT id INTO buyer3_id FROM users WHERE email = 'buyer3@test.com';

    -- Запись 1: Женская стрижка (подтверждена)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service1_id, service_seller1_id, buyer1_id, 'Айнура Садыкова', '+996700111111', NOW() + INTERVAL '2 days' + INTERVAL '10 hours', 'Хочу обновить стрижку, пожалуйста сделайте как в прошлый раз', 'confirmed', NOW() - INTERVAL '3 days');

    -- Запись 2: Окрашивание волос (ожидает подтверждения)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service2_id, service_seller1_id, buyer2_id, 'Бекзат Алиев', '+996700222222', NOW() + INTERVAL '5 days' + INTERVAL '14 hours', NULL, 'pending', NOW() - INTERVAL '1 day');

    -- Запись 3: Занятие по математике (подтверждена)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service3_id, service_seller2_id, buyer3_id, 'Гульнара Осмонова', '+996700333333', NOW() + INTERVAL '1 day' + INTERVAL '16 hours', 'Нужна помощь с алгеброй, 9 класс', 'confirmed', NOW() - INTERVAL '5 days');

    -- Запись 4: Маникюр (подтверждена)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service5_id, service_seller3_id, buyer1_id, 'Айнура Садыкова', '+996700111111', NOW() + INTERVAL '3 days' + INTERVAL '11 hours', 'Хочу красный гель-лак', 'confirmed', NOW() - INTERVAL '2 days');

    -- Запись 5: Массаж спины (завершена)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service7_id, service_seller4_id, buyer2_id, 'Бекзат Алиев', '+996700222222', NOW() - INTERVAL '5 days', 'Болит спина после тренировок', 'completed', NOW() - INTERVAL '10 days');

    -- Запись 6: Педикюр (завершена)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service6_id, service_seller3_id, buyer3_id, 'Гульнара Осмонова', '+996700333333', NOW() - INTERVAL '7 days', NULL, 'completed', NOW() - INTERVAL '12 days');

    -- Запись 7: От незарегистрированного клиента (ожидает подтверждения)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service1_id, service_seller1_id, NULL, 'Нурия Касымова', '+996777123456', NOW() + INTERVAL '4 days' + INTERVAL '13 hours', 'Первый раз у вас, хочу сделать каре', 'pending', NOW() - INTERVAL '6 hours');

    -- Запись 8: Подготовка к ОРТ (отменена клиентом)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service4_id, service_seller2_id, buyer1_id, 'Айнура Садыкова', '+996700111111', NOW() + INTERVAL '1 day' + INTERVAL '15 hours', 'Нужна подготовка для сына', 'cancelled', NOW() - INTERVAL '4 days');

    -- Запись 9: Антицеллюлитный массаж (подтверждена)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service8_id, service_seller4_id, buyer2_id, 'Бекзат Алиев', '+996700222222', NOW() + INTERVAL '6 days' + INTERVAL '17 hours', 'Хочу записаться на курс из 5 сеансов', 'confirmed', NOW() - INTERVAL '1 day');

    -- Запись 10: Классический массаж (от незарегистрированного)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES
    (service7_id, service_seller4_id, NULL, 'Марат Сыдыков', '+996555999888', NOW() + INTERVAL '7 days' + INTERVAL '12 hours', NULL, 'pending', NOW() - INTERVAL '3 hours');

    RAISE NOTICE '✓ Создано 10 записей на услуги';

END $$;

COMMIT;

-- =====================================================================
-- ИТОГОВАЯ СТАТИСТИКА
-- =====================================================================

DO $$
DECLARE
    services_count INT;
    bookings_count INT;
    bookings_confirmed INT;
    bookings_pending INT;
    bookings_completed INT;
    bookings_cancelled INT;
BEGIN
    SELECT COUNT(*) INTO services_count FROM products WHERE product_type = 'service';
    SELECT COUNT(*) INTO bookings_count FROM bookings;
    SELECT COUNT(*) INTO bookings_confirmed FROM bookings WHERE status = 'confirmed';
    SELECT COUNT(*) INTO bookings_pending FROM bookings WHERE status = 'pending';
    SELECT COUNT(*) INTO bookings_completed FROM bookings WHERE status = 'completed';
    SELECT COUNT(*) INTO bookings_cancelled FROM bookings WHERE status = 'cancelled';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'УСЛУГИ И ЗАПИСИ СОЗДАНЫ!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Продавцов услуг: 4';
    RAISE NOTICE 'Услуг: %', services_count;
    RAISE NOTICE 'Записей: %', bookings_count;
    RAISE NOTICE '  - Подтверждено: %', bookings_confirmed;
    RAISE NOTICE '  - Ожидает: %', bookings_pending;
    RAISE NOTICE '  - Завершено: %', bookings_completed;
    RAISE NOTICE '  - Отменено: %', bookings_cancelled;
    RAISE NOTICE '========================================';
END $$;
