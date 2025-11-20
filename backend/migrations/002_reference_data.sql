-- =====================================================================
-- Скрипт 2: Справочные данные (города, рынки, категории)
-- =====================================================================
-- Описание: Загрузка реальных справочных данных для Кыргызстана
-- Запуск: docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/002_reference_data.sql
-- =====================================================================

BEGIN;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ЗАГРУЗКА СПРАВОЧНЫХ ДАННЫХ';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================================
-- 1. ГОРОДА КЫРГЫЗСТАНА
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Загрузка городов...';
END $$;

INSERT INTO cities (id, name, slug, region, sort_order) VALUES
(1, 'Бишкек', 'bishkek', 'Чуйская область', 1),
(2, 'Ош', 'osh', 'Ошская область', 2),
(3, 'Джалал-Абад', 'jalal-abad', 'Джалал-Абадская область', 3),
(4, 'Каракол', 'karakol', 'Иссык-Кульская область', 4),
(5, 'Токмок', 'tokmok', 'Чуйская область', 5),
(6, 'Кара-Балта', 'kara-balta', 'Чуйская область', 6),
(7, 'Талас', 'talas', 'Таласская область', 7),
(8, 'Нарын', 'naryn', 'Нарынская область', 8),
(9, 'Баткен', 'batken', 'Баткенская область', 9),
(10, 'Кызыл-Кыя', 'kyzyl-kya', 'Баткенская область', 10),
(11, 'Кант', 'kant', 'Чуйская область', 11),
(12, 'Чолпон-Ата', 'cholpon-ata', 'Иссык-Кульская область', 12),
(13, 'Узген', 'uzgen', 'Ошская область', 13),
(14, 'Кара-Суу', 'kara-suu', 'Ошская область', 14),
(15, 'Ноокат', 'nookat', 'Ошская область', 15)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    RAISE NOTICE '✓ Загружено 15 городов';
END $$;

-- =====================================================================
-- 2. РЫНКИ
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Загрузка рынков...';
END $$;

-- Рынки Бишкека
INSERT INTO markets (id, city_id, name, address, latitude, longitude) VALUES
(1, 1, 'Дордой', 'мкр. Дордой, Бишкек', 42.8796, 74.6281),
(2, 1, 'Ошский рынок', 'ул. Киевская, Бишкек', 42.8535, 74.6197),
(3, 1, 'Ортосайский рынок', 'мкр. Кок-Жар, Бишкек', 42.8219, 74.5625),
(4, 1, 'Аламединский рынок', 'мкр. Аламедин-1, Бишкек', 42.8409, 74.5352),
(5, 1, 'Рынок Дыйкан', 'ул. Ахунбаева, Бишкек', 42.8687, 74.6009),
(6, 2, 'Рынок Жайма', 'г. Ош, Ошская область', 40.5283, 72.7985),
(7, 2, 'Рынок Кара-Суу', 'г. Ош, Ошская область', 40.5269, 72.8047),
(8, 3, 'Центральный рынок', 'г. Джалал-Абад', 40.9363, 72.9977),
(9, 4, 'Центральный рынок', 'г. Каракол', 42.4908, 78.3938),
(10, 5, 'Рынок Токмок', 'г. Токмок', 42.8422, 75.2955)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    RAISE NOTICE '✓ Загружено 10 рынков';
END $$;

-- =====================================================================
-- 3. КАТЕГОРИИ (3 уровня)
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Загрузка категорий...';
END $$;

-- === УРОВЕНЬ 1: Основные категории ===
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(1, NULL, 'Одежда', 'clothes', 1, 'shirt', 1, true),
(2, NULL, 'Обувь', 'shoes', 1, 'shoe', 2, true),
(3, NULL, 'Электроника', 'electronics', 1, 'phone', 3, true),
(4, NULL, 'Продукты питания', 'food', 1, 'shopping-cart', 4, true),
(5, NULL, 'Товары для дома', 'home', 1, 'home', 5, true),
(6, NULL, 'Косметика и красота', 'beauty', 1, 'sparkles', 6, true),
(7, NULL, 'Детские товары', 'kids', 1, 'baby', 7, true),
(8, NULL, 'Спорт и отдых', 'sports', 1, 'football', 8, true),
(9, NULL, 'Услуги', 'services', 1, 'briefcase', 9, true),
(10, NULL, 'Авто и мото', 'auto', 1, 'car', 10, true)
ON CONFLICT (id) DO NOTHING;

-- === УРОВЕНЬ 2: Подкатегории ===

-- Одежда (1)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(11, 1, 'Мужская одежда', 'clothes-men', 2, NULL, 1, true),
(12, 1, 'Женская одежда', 'clothes-women', 2, NULL, 2, true),
(13, 1, 'Верхняя одежда', 'clothes-outerwear', 2, NULL, 3, true),
(14, 1, 'Аксессуары', 'clothes-accessories', 2, NULL, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Обувь (2)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(21, 2, 'Мужская обувь', 'shoes-men', 2, NULL, 1, true),
(22, 2, 'Женская обувь', 'shoes-women', 2, NULL, 2, true),
(23, 2, 'Детская обувь', 'shoes-kids', 2, NULL, 3, true),
(24, 2, 'Спортивная обувь', 'shoes-sports', 2, NULL, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Электроника (3)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(31, 3, 'Смартфоны и телефоны', 'electronics-phones', 2, NULL, 1, true),
(32, 3, 'Компьютеры и ноутбуки', 'electronics-computers', 2, NULL, 2, true),
(33, 3, 'ТВ и аудио', 'electronics-tv-audio', 2, NULL, 3, true),
(34, 3, 'Аксессуары', 'electronics-accessories', 2, NULL, 4, true),
(35, 3, 'Бытовая техника', 'electronics-appliances', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Продукты питания (4)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(41, 4, 'Молочные продукты', 'food-dairy', 2, NULL, 1, true),
(42, 4, 'Мясо и птица', 'food-meat', 2, NULL, 2, true),
(43, 4, 'Овощи и фрукты', 'food-vegetables', 2, NULL, 3, true),
(44, 4, 'Хлеб и выпечка', 'food-bakery', 2, NULL, 4, true),
(45, 4, 'Напитки', 'food-drinks', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Товары для дома (5)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(51, 5, 'Мебель', 'home-furniture', 2, NULL, 1, true),
(52, 5, 'Текстиль', 'home-textile', 2, NULL, 2, true),
(53, 5, 'Посуда', 'home-dishes', 2, NULL, 3, true),
(54, 5, 'Декор', 'home-decor', 2, NULL, 4, true),
(55, 5, 'Освещение', 'home-lighting', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Косметика и красота (6)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(61, 6, 'Уход за лицом', 'beauty-face', 2, NULL, 1, true),
(62, 6, 'Уход за телом', 'beauty-body', 2, NULL, 2, true),
(63, 6, 'Макияж', 'beauty-makeup', 2, NULL, 3, true),
(64, 6, 'Парфюмерия', 'beauty-perfume', 2, NULL, 4, true),
(65, 6, 'Уход за волосами', 'beauty-hair', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Детские товары (7)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(71, 7, 'Детская одежда', 'kids-clothes', 2, NULL, 1, true),
(72, 7, 'Игрушки', 'kids-toys', 2, NULL, 2, true),
(73, 7, 'Детская мебель', 'kids-furniture', 2, NULL, 3, true),
(74, 7, 'Товары для новорожденных', 'kids-baby', 2, NULL, 4, true),
(75, 7, 'Детское питание', 'kids-food', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Спорт и отдых (8)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(81, 8, 'Спортивная одежда', 'sports-clothes', 2, NULL, 1, true),
(82, 8, 'Спортивное оборудование', 'sports-equipment', 2, NULL, 2, true),
(83, 8, 'Фитнес', 'sports-fitness', 2, NULL, 3, true),
(84, 8, 'Туризм и кемпинг', 'sports-camping', 2, NULL, 4, true),
(85, 8, 'Велосипеды', 'sports-bikes', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Услуги (9)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(91, 9, 'Красота и здоровье', 'services-beauty', 2, NULL, 1, true),
(92, 9, 'Образование', 'services-education', 2, NULL, 2, true),
(93, 9, 'Ремонт и строительство', 'services-repair', 2, NULL, 3, true),
(94, 9, 'Авто услуги', 'services-auto', 2, NULL, 4, true),
(95, 9, 'Домашние услуги', 'services-home', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Авто и мото (10)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(101, 10, 'Автомобили', 'auto-cars', 2, NULL, 1, true),
(102, 10, 'Мотоциклы', 'auto-motorcycles', 2, NULL, 2, true),
(103, 10, 'Запчасти', 'auto-parts', 2, NULL, 3, true),
(104, 10, 'Шины и диски', 'auto-tires', 2, NULL, 4, true),
(105, 10, 'Аксессуары', 'auto-accessories', 2, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- === УРОВЕНЬ 3: Детальные категории (примеры) ===

-- Мужская одежда (11)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(111, 11, 'Футболки и майки', 'clothes-men-tshirts', 3, NULL, 1, true),
(112, 11, 'Рубашки', 'clothes-men-shirts', 3, NULL, 2, true),
(113, 11, 'Брюки и джинсы', 'clothes-men-pants', 3, NULL, 3, true),
(114, 11, 'Костюмы', 'clothes-men-suits', 3, NULL, 4, true),
(115, 11, 'Нижнее белье', 'clothes-men-underwear', 3, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Женская одежда (12)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(121, 12, 'Платья и сарафаны', 'clothes-women-dresses', 3, NULL, 1, true),
(122, 12, 'Блузки и рубашки', 'clothes-women-blouses', 3, NULL, 2, true),
(123, 12, 'Брюки и джинсы', 'clothes-women-pants', 3, NULL, 3, true),
(124, 12, 'Юбки', 'clothes-women-skirts', 3, NULL, 4, true),
(125, 12, 'Нижнее белье', 'clothes-women-underwear', 3, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Смартфоны и телефоны (31)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(311, 31, 'Apple iPhone', 'electronics-phones-iphone', 3, NULL, 1, true),
(312, 31, 'Samsung', 'electronics-phones-samsung', 3, NULL, 2, true),
(313, 31, 'Xiaomi', 'electronics-phones-xiaomi', 3, NULL, 3, true),
(314, 31, 'Кнопочные телефоны', 'electronics-phones-button', 3, NULL, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Красота и здоровье (91)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(911, 91, 'Парикмахерские услуги', 'services-beauty-hair', 3, NULL, 1, true),
(912, 91, 'Маникюр и педикюр', 'services-beauty-nails', 3, NULL, 2, true),
(913, 91, 'Массаж', 'services-beauty-massage', 3, NULL, 3, true),
(914, 91, 'Косметология', 'services-beauty-cosmetology', 3, NULL, 4, true),
(915, 91, 'Стоматология', 'services-beauty-dental', 3, NULL, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Образование (92)
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(921, 92, 'Репетиторство', 'services-education-tutoring', 3, NULL, 1, true),
(922, 92, 'Языковые курсы', 'services-education-languages', 3, NULL, 2, true),
(923, 92, 'Компьютерные курсы', 'services-education-computer', 3, NULL, 3, true),
(924, 92, 'Музыка и танцы', 'services-education-music', 3, NULL, 4, true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    RAISE NOTICE '✓ Загружено категорий: 10 уровня 1, 50 уровня 2, 27 уровня 3';
END $$;

-- Установка правильной последовательности для AUTO_INCREMENT
SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities));
SELECT setval('markets_id_seq', (SELECT MAX(id) FROM markets));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

COMMIT;

-- =====================================================================
-- ИТОГОВАЯ СТАТИСТИКА
-- =====================================================================

DO $$
DECLARE
    cities_count INT;
    markets_count INT;
    categories_l1 INT;
    categories_l2 INT;
    categories_l3 INT;
BEGIN
    SELECT COUNT(*) INTO cities_count FROM cities;
    SELECT COUNT(*) INTO markets_count FROM markets;
    SELECT COUNT(*) INTO categories_l1 FROM categories WHERE level = 1;
    SELECT COUNT(*) INTO categories_l2 FROM categories WHERE level = 2;
    SELECT COUNT(*) INTO categories_l3 FROM categories WHERE level = 3;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'СПРАВОЧНЫЕ ДАННЫЕ ЗАГРУЖЕНЫ!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Городов: %', cities_count;
    RAISE NOTICE 'Рынков: %', markets_count;
    RAISE NOTICE 'Категорий:';
    RAISE NOTICE '  - Уровень 1: %', categories_l1;
    RAISE NOTICE '  - Уровень 2: %', categories_l2;
    RAISE NOTICE '  - Уровень 3: %', categories_l3;
    RAISE NOTICE '  - Всего: %', categories_l1 + categories_l2 + categories_l3;
    RAISE NOTICE '========================================';
END $$;
