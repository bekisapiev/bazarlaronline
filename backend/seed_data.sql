-- Seed data for Bazarlar Online
-- Данные для продакшна: категории, города и рынки Кыргызстана

-- ============================================
-- ГОРОДА КЫРГЫЗСТАНА
-- ============================================

-- Очистка старых данных (осторожно!)
-- TRUNCATE TABLE markets CASCADE;
-- TRUNCATE TABLE cities CASCADE;
-- DELETE FROM categories WHERE id > 0;

-- Города (все областные центры и крупные города)
INSERT INTO cities (name, slug, region, sort_order) VALUES
-- Чуйская область
('Бишкек', 'bishkek', 'Чуйская область', 1),
('Токмок', 'tokmok', 'Чуйская область', 2),
('Кант', 'kant', 'Чуйская область', 3),
('Кара-Балта', 'kara-balta', 'Чуйская область', 4),
('Кемин', 'kemin', 'Чуйская область', 5),
('Сокулук', 'sokuluk', 'Чуйская область', 6),

-- Ошская область
('Ош', 'osh', 'Ошская область', 10),
('Узген', 'uzgen', 'Ошская область', 11),
('Кара-Суу', 'kara-suu', 'Ошская область', 12),
('Ноокат', 'nookat', 'Ошская область', 13),

-- Джалал-Абадская область
('Джалал-Абад', 'jalal-abad', 'Джалал-Абадская область', 20),
('Кара-Куль', 'kara-kul', 'Джалал-Абадская область', 21),
('Базар-Коргон', 'bazar-korgon', 'Джалал-Абадская область', 22),
('Таш-Кумыр', 'tash-kumyr', 'Джалал-Абадская область', 23),

-- Баткенская область
('Баткен', 'batken', 'Баткенская область', 30),
('Исфана', 'isfana', 'Баткенская область', 31),
('Кызыл-Кия', 'kyzyl-kiya', 'Баткенская область', 32),
('Сулюкта', 'sulukta', 'Баткенская область', 33),

-- Иссык-Кульская область
('Каракол', 'karakol', 'Иссык-Кульская область', 40),
('Балыкчы', 'balykchy', 'Иссык-Кульская область', 41),
('Чолпон-Ата', 'cholpon-ata', 'Иссык-Кульская область', 42),
('Ак-Суу', 'ak-suu', 'Иссык-Кульская область', 43),

-- Нарынская область
('Нарын', 'naryn', 'Нарынская область', 50),
('Ат-Башы', 'at-bashy', 'Нарынская область', 51),
('Кочкор', 'kochkor', 'Нарынская область', 52),

-- Таласская область
('Талас', 'talas', 'Таласская область', 60),
('Кара-Буура', 'kara-buura', 'Таласская область', 61),
('Манас', 'manas', 'Таласская область', 62)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- РЫНКИ КЫРГЫЗСТАНА
-- ============================================

-- Рынки Бишкека
INSERT INTO markets (city_id, name, address, latitude, longitude) VALUES
-- Бишкек
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Дордой', 'ул. Шабдан Баатыра, Бишкек', 42.9056, 74.6331),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Ош базар', 'пр. Чуй / ул. Исанова, Бишкек', 42.8746, 74.6122),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Аламединский рынок', 'ул. Алматинская, Бишкек', 42.8598, 74.5876),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Ортосайский рынок', 'ул. Фрунзе, Бишкек', 42.8456, 74.6214),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Восточный рынок', 'ул. Льва Толстого, Бишкек', 42.8734, 74.6443),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Аламүдүн базары', 'ул. Алматинская, Бишкек', 42.8612, 74.5892),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Бишкекский рынок', 'ул. Киевская, Бишкек', 42.8634, 74.5998),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Кудайберген рынок', 'ул. Кудайберген, Бишкек', 42.8423, 74.5723),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Рынок Дыйкан', 'ул. Боконбаева, Бишкек', 42.8512, 74.6089),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Рынок Юнусабад', 'ул. Ахунбаева, Бишкек', 42.8934, 74.6245),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Рынок Мадина', 'ул. Жукеева-Пудовкина, Бишкек', 42.8378, 74.5834),
((SELECT id FROM cities WHERE slug = 'bishkek'), 'Рынок Карагачевая Роща', 'ул. Турусбекова, Бishкек', 42.8234, 74.5645),

-- Ош
((SELECT id FROM cities WHERE slug = 'osh'), 'Жайма базар', 'пр. Ленина, Ош', 40.5283, 72.7985),
((SELECT id FROM cities WHERE slug = 'osh'), 'Кок базар', 'ул. Кыргызстан, Ош', 40.5156, 72.8034),
((SELECT id FROM cities WHERE slug = 'osh'), 'Кара-Суу рынок', 'г. Ош, район Кара-Суу', 40.5423, 72.8123),
((SELECT id FROM cities WHERE slug = 'osh'), 'Мадина базар', 'ул. Масалиева, Ош', 40.5234, 72.7856),

-- Джалал-Абад
((SELECT id FROM cities WHERE slug = 'jalal-abad'), 'Центральный рынок', 'пр. Ленина, Джалал-Абад', 40.9364, 72.9956),
((SELECT id FROM cities WHERE slug = 'jalal-abad'), 'Западный рынок', 'ул. Эркиндик, Джалал-Абад', 40.9312, 72.9823),

-- Токмок
((SELECT id FROM cities WHERE slug = 'tokmok'), 'Центральный рынок Токмок', 'пр. Фрунзе, Токмок', 42.8423, 75.2956),
((SELECT id FROM cities WHERE slug = 'tokmok'), 'Овощной рынок', 'ул. Ленина, Токмок', 42.8389, 75.2878),

-- Каракол
((SELECT id FROM cities WHERE slug = 'karakol'), 'Центральный рынок Каракол', 'ул. Абдрахманова, Каракол', 42.4906, 78.3934),
((SELECT id FROM cities WHERE slug = 'karakol'), 'Дыйкан базар', 'ул. Пржевальского, Каракол', 42.4867, 78.3889),

-- Кара-Балта
((SELECT id FROM cities WHERE slug = 'kara-balta'), 'Центральный рынок', 'ул. Гагарина, Кара-Балта', 42.8145, 73.8467),

-- Нарын
((SELECT id FROM cities WHERE slug = 'naryn'), 'Центральный рынок Нарын', 'ул. Ленина, Нарын', 41.4289, 76.0012),

-- Талас
((SELECT id FROM cities WHERE slug = 'talas'), 'Центральный рынок Талас', 'пр. Манаса, Талас', 42.5228, 72.2419),

-- Баткен
((SELECT id FROM cities WHERE slug = 'batken'), 'Центральный рынок Баткен', 'ул. Ленина, Баткен', 40.0634, 70.8189),

-- Узген
((SELECT id FROM cities WHERE slug = 'uzgen'), 'Узгенский рынок', 'ул. Ленина, Узген', 40.7697, 73.3008),

-- Кара-Суу (город)
((SELECT id FROM cities WHERE slug = 'kara-suu'), 'Кара-Суу базар', 'г. Кара-Суу', 40.7056, 72.8734),

-- Балыкчы
((SELECT id FROM cities WHERE slug = 'balykchy'), 'Рыбный рынок', 'ул. Советская, Балыкчы', 42.4601, 76.1889),

-- Кант
((SELECT id FROM cities WHERE slug = 'kant'), 'Кантский рынок', 'ул. Ленина, Кант', 42.8890, 74.8534)
ON CONFLICT DO NOTHING;

-- ============================================
-- КАТЕГОРИИ (3 уровня)
-- ============================================

-- Сброс последовательности
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- УРОВЕНЬ 1: Одежда и обувь
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Одежда и обувь', 'clothing-shoes', 1, NULL, 1, true);

-- УРОВЕНЬ 2: Подкатегории одежды
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Женская одежда', 'womens-clothing', 2, (SELECT id FROM categories WHERE slug = 'clothing-shoes'), 1, true),
('Мужская одежда', 'mens-clothing', 2, (SELECT id FROM categories WHERE slug = 'clothing-shoes'), 2, true),
('Детская одежда', 'kids-clothing', 2, (SELECT id FROM categories WHERE slug = 'clothing-shoes'), 3, true),
('Обувь', 'shoes', 2, (SELECT id FROM categories WHERE slug = 'clothing-shoes'), 4, true),
('Аксессуары', 'accessories', 2, (SELECT id FROM categories WHERE slug = 'clothing-shoes'), 5, true);

-- УРОВЕНЬ 3: Разделы женской одежды
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Платья', 'dresses', 3, (SELECT id FROM categories WHERE slug = 'womens-clothing'), 1, true),
('Блузки и рубашки', 'blouses-shirts', 3, (SELECT id FROM categories WHERE slug = 'womens-clothing'), 2, true),
('Брюки и джинсы', 'pants-jeans-w', 3, (SELECT id FROM categories WHERE slug = 'womens-clothing'), 3, true),
('Юбки', 'skirts', 3, (SELECT id FROM categories WHERE slug = 'womens-clothing'), 4, true),
('Верхняя одежда', 'outerwear-w', 3, (SELECT id FROM categories WHERE slug = 'womens-clothing'), 5, true),
('Трикотаж', 'knitwear-w', 3, (SELECT id FROM categories WHERE slug = 'womens-clothing'), 6, true);

-- УРОВЕНЬ 3: Разделы мужской одежды
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Рубашки', 'shirts-m', 3, (SELECT id FROM categories WHERE slug = 'mens-clothing'), 1, true),
('Брюки и джинсы', 'pants-jeans-m', 3, (SELECT id FROM categories WHERE slug = 'mens-clothing'), 2, true),
('Костюмы', 'suits', 3, (SELECT id FROM categories WHERE slug = 'mens-clothing'), 3, true),
('Верхняя одежда', 'outerwear-m', 3, (SELECT id FROM categories WHERE slug = 'mens-clothing'), 4, true),
('Футболки и поло', 'tshirts-polo', 3, (SELECT id FROM categories WHERE slug = 'mens-clothing'), 5, true);

-- УРОВЕНЬ 3: Разделы детской одежды
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Для новорожденных', 'newborn', 3, (SELECT id FROM categories WHERE slug = 'kids-clothing'), 1, true),
('Для мальчиков', 'boys', 3, (SELECT id FROM categories WHERE slug = 'kids-clothing'), 2, true),
('Для девочек', 'girls', 3, (SELECT id FROM categories WHERE slug = 'kids-clothing'), 3, true),
('Школьная форма', 'school-uniform', 3, (SELECT id FROM categories WHERE slug = 'kids-clothing'), 4, true);

-- УРОВЕНЬ 3: Разделы обуви
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Женская обувь', 'womens-shoes', 3, (SELECT id FROM categories WHERE slug = 'shoes'), 1, true),
('Мужская обувь', 'mens-shoes', 3, (SELECT id FROM categories WHERE slug = 'shoes'), 2, true),
('Детская обувь', 'kids-shoes', 3, (SELECT id FROM categories WHERE slug = 'shoes'), 3, true),
('Спортивная обувь', 'sports-shoes', 3, (SELECT id FROM categories WHERE slug = 'shoes'), 4, true);

-- ============================================
-- УРОВЕНЬ 1: Электроника
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Электроника', 'electronics', 1, NULL, 2, true);

-- УРОВЕНЬ 2: Подкатегории электроники
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Телефоны и планшеты', 'phones-tablets', 2, (SELECT id FROM categories WHERE slug = 'electronics'), 1, true),
('Компьютеры и ноутбуки', 'computers', 2, (SELECT id FROM categories WHERE slug = 'electronics'), 2, true),
('ТВ и видео', 'tv-video', 2, (SELECT id FROM categories WHERE slug = 'electronics'), 3, true),
('Аудиотехника', 'audio', 2, (SELECT id FROM categories WHERE slug = 'electronics'), 4, true),
('Фото и видеокамеры', 'cameras', 2, (SELECT id FROM categories WHERE slug = 'electronics'), 5, true);

-- УРОВЕНЬ 3: Разделы телефонов
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Смартфоны', 'smartphones', 3, (SELECT id FROM categories WHERE slug = 'phones-tablets'), 1, true),
('Кнопочные телефоны', 'feature-phones', 3, (SELECT id FROM categories WHERE slug = 'phones-tablets'), 2, true),
('Планшеты', 'tablets', 3, (SELECT id FROM categories WHERE slug = 'phones-tablets'), 3, true),
('Аксессуары для телефонов', 'phone-accessories', 3, (SELECT id FROM categories WHERE slug = 'phones-tablets'), 4, true);

-- УРОВЕНЬ 3: Разделы компьютеров
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Ноутбуки', 'laptops', 3, (SELECT id FROM categories WHERE slug = 'computers'), 1, true),
('Настольные компьютеры', 'desktops', 3, (SELECT id FROM categories WHERE slug = 'computers'), 2, true),
('Комплектующие', 'pc-parts', 3, (SELECT id FROM categories WHERE slug = 'computers'), 3, true),
('Периферия', 'peripherals', 3, (SELECT id FROM categories WHERE slug = 'computers'), 4, true);

-- ============================================
-- УРОВЕНЬ 1: Дом и сад
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Дом и сад', 'home-garden', 1, NULL, 3, true);

-- УРОВЕНЬ 2: Подкатегории дома и сада
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Мебель', 'furniture', 2, (SELECT id FROM categories WHERE slug = 'home-garden'), 1, true),
('Бытовая техника', 'appliances', 2, (SELECT id FROM categories WHERE slug = 'home-garden'), 2, true),
('Посуда и кухонные принадлежности', 'kitchenware', 2, (SELECT id FROM categories WHERE slug = 'home-garden'), 3, true),
('Текстиль для дома', 'home-textiles', 2, (SELECT id FROM categories WHERE slug = 'home-garden'), 4, true),
('Инструменты и садовый инвентарь', 'tools-garden', 2, (SELECT id FROM categories WHERE slug = 'home-garden'), 5, true);

-- УРОВЕНЬ 3: Разделы мебели
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Мягкая мебель', 'soft-furniture', 3, (SELECT id FROM categories WHERE slug = 'furniture'), 1, true),
('Кухонная мебель', 'kitchen-furniture', 3, (SELECT id FROM categories WHERE slug = 'furniture'), 2, true),
('Спальная мебель', 'bedroom-furniture', 3, (SELECT id FROM categories WHERE slug = 'furniture'), 3, true),
('Офисная мебель', 'office-furniture', 3, (SELECT id FROM categories WHERE slug = 'furniture'), 4, true);

-- УРОВЕНЬ 3: Разделы бытовой техники
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Крупная техника', 'major-appliances', 3, (SELECT id FROM categories WHERE slug = 'appliances'), 1, true),
('Мелкая техника', 'small-appliances', 3, (SELECT id FROM categories WHERE slug = 'appliances'), 2, true),
('Климатическая техника', 'climate-appliances', 3, (SELECT id FROM categories WHERE slug = 'appliances'), 3, true);

-- ============================================
-- УРОВЕНЬ 1: Продукты питания
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Продукты питания', 'food', 1, NULL, 4, true);

-- УРОВЕНЬ 2: Подкатегории продуктов
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Мясо и птица', 'meat-poultry', 2, (SELECT id FROM categories WHERE slug = 'food'), 1, true),
('Молочные продукты', 'dairy', 2, (SELECT id FROM categories WHERE slug = 'food'), 2, true),
('Фрукты и овощи', 'fruits-vegetables', 2, (SELECT id FROM categories WHERE slug = 'food'), 3, true),
('Хлеб и выпечка', 'bakery', 2, (SELECT id FROM categories WHERE slug = 'food'), 4, true),
('Бакалея', 'groceries', 2, (SELECT id FROM categories WHERE slug = 'food'), 5, true),
('Напитки', 'beverages', 2, (SELECT id FROM categories WHERE slug = 'food'), 6, true);

-- УРОВЕНЬ 3: Разделы мяса
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Говядина', 'beef', 3, (SELECT id FROM categories WHERE slug = 'meat-poultry'), 1, true),
('Баранина', 'lamb', 3, (SELECT id FROM categories WHERE slug = 'meat-poultry'), 2, true),
('Курица', 'chicken', 3, (SELECT id FROM categories WHERE slug = 'meat-poultry'), 3, true),
('Колбасные изделия', 'sausages', 3, (SELECT id FROM categories WHERE slug = 'meat-poultry'), 4, true);

-- УРОВЕНЬ 3: Разделы фруктов и овощей
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Фрукты', 'fruits', 3, (SELECT id FROM categories WHERE slug = 'fruits-vegetables'), 1, true),
('Овощи', 'vegetables', 3, (SELECT id FROM categories WHERE slug = 'fruits-vegetables'), 2, true),
('Зелень', 'greens', 3, (SELECT id FROM categories WHERE slug = 'fruits-vegetables'), 3, true),
('Сухофрукты и орехи', 'dried-fruits-nuts', 3, (SELECT id FROM categories WHERE slug = 'fruits-vegetables'), 4, true);

-- ============================================
-- УРОВЕНЬ 1: Красота и здоровье
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Красота и здоровье', 'beauty-health', 1, NULL, 5, true);

-- УРОВЕНЬ 2: Подкатегории
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Косметика', 'cosmetics', 2, (SELECT id FROM categories WHERE slug = 'beauty-health'), 1, true),
('Парфюмерия', 'perfumes', 2, (SELECT id FROM categories WHERE slug = 'beauty-health'), 2, true),
('Уход за волосами', 'hair-care', 2, (SELECT id FROM categories WHERE slug = 'beauty-health'), 3, true),
('Уход за телом', 'body-care', 2, (SELECT id FROM categories WHERE slug = 'beauty-health'), 4, true),
('Медицинские товары', 'medical-goods', 2, (SELECT id FROM categories WHERE slug = 'beauty-health'), 5, true);

-- УРОВЕНЬ 3: Разделы косметики
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Декоративная косметика', 'makeup', 3, (SELECT id FROM categories WHERE slug = 'cosmetics'), 1, true),
('Уход за лицом', 'face-care', 3, (SELECT id FROM categories WHERE slug = 'cosmetics'), 2, true),
('Уход за кожей', 'skin-care', 3, (SELECT id FROM categories WHERE slug = 'cosmetics'), 3, true);

-- ============================================
-- УРОВЕНЬ 1: Спорт и отдых
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Спорт и отдых', 'sports-leisure', 1, NULL, 6, true);

-- УРОВЕНЬ 2: Подкатегории
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Спортивная одежда и обувь', 'sportswear', 2, (SELECT id FROM categories WHERE slug = 'sports-leisure'), 1, true),
('Фитнес и тренажеры', 'fitness', 2, (SELECT id FROM categories WHERE slug = 'sports-leisure'), 2, true),
('Туризм и кемпинг', 'camping', 2, (SELECT id FROM categories WHERE slug = 'sports-leisure'), 3, true),
('Велосипеды и самокаты', 'bikes-scooters', 2, (SELECT id FROM categories WHERE slug = 'sports-leisure'), 4, true);

-- УРОВЕНЬ 3: Разделы спортивной одежды
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Одежда для фитнеса', 'fitness-wear', 3, (SELECT id FROM categories WHERE slug = 'sportswear'), 1, true),
('Одежда для бега', 'running-wear', 3, (SELECT id FROM categories WHERE slug = 'sportswear'), 2, true),
('Спортивная обувь', 'sports-footwear', 3, (SELECT id FROM categories WHERE slug = 'sportswear'), 3, true);

-- ============================================
-- УРОВЕНЬ 1: Автотовары
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Автотовары', 'auto', 1, NULL, 7, true);

-- УРОВЕНЬ 2: Подкатегории
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Запчасти', 'auto-parts', 2, (SELECT id FROM categories WHERE slug = 'auto'), 1, true),
('Аксессуары для авто', 'auto-accessories', 2, (SELECT id FROM categories WHERE slug = 'auto'), 2, true),
('Шины и диски', 'tires-wheels', 2, (SELECT id FROM categories WHERE slug = 'auto'), 3, true),
('Автохимия', 'auto-chemicals', 2, (SELECT id FROM categories WHERE slug = 'auto'), 4, true);

-- УРОВЕНЬ 3: Разделы запчастей
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Двигатель', 'engine-parts', 3, (SELECT id FROM categories WHERE slug = 'auto-parts'), 1, true),
('Подвеска', 'suspension', 3, (SELECT id FROM categories WHERE slug = 'auto-parts'), 2, true),
('Тормозная система', 'brakes', 3, (SELECT id FROM categories WHERE slug = 'auto-parts'), 3, true),
('Электрооборудование', 'auto-electrics', 3, (SELECT id FROM categories WHERE slug = 'auto-parts'), 4, true);

-- ============================================
-- УРОВЕНЬ 1: Строительство и ремонт
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Строительство и ремонт', 'construction', 1, NULL, 8, true);

-- УРОВЕНЬ 2: Подкатегории
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Стройматериалы', 'building-materials', 2, (SELECT id FROM categories WHERE slug = 'construction'), 1, true),
('Инструменты', 'tools', 2, (SELECT id FROM categories WHERE slug = 'construction'), 2, true),
('Сантехника', 'plumbing', 2, (SELECT id FROM categories WHERE slug = 'construction'), 3, true),
('Электротовары', 'electrical-goods', 2, (SELECT id FROM categories WHERE slug = 'construction'), 4, true),
('Отделочные материалы', 'finishing-materials', 2, (SELECT id FROM categories WHERE slug = 'construction'), 5, true);

-- УРОВЕНЬ 3: Разделы стройматериалов
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Кирпич и блоки', 'bricks-blocks', 3, (SELECT id FROM categories WHERE slug = 'building-materials'), 1, true),
('Цемент и смеси', 'cement-mixes', 3, (SELECT id FROM categories WHERE slug = 'building-materials'), 2, true),
('Пиломатериалы', 'lumber', 3, (SELECT id FROM categories WHERE slug = 'building-materials'), 3, true),
('Кровельные материалы', 'roofing', 3, (SELECT id FROM categories WHERE slug = 'building-materials'), 4, true);

-- ============================================
-- УРОВЕНЬ 1: Товары для детей
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Товары для детей', 'kids-goods', 1, NULL, 9, true);

-- УРОВЕНЬ 2: Подкатегории
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Игрушки', 'toys', 2, (SELECT id FROM categories WHERE slug = 'kids-goods'), 1, true),
('Детская мебель', 'kids-furniture', 2, (SELECT id FROM categories WHERE slug = 'kids-goods'), 2, true),
('Коляски и автокресла', 'strollers-carseats', 2, (SELECT id FROM categories WHERE slug = 'kids-goods'), 3, true),
('Школьные товары', 'school-supplies', 2, (SELECT id FROM categories WHERE slug = 'kids-goods'), 4, true),
('Детское питание', 'baby-food', 2, (SELECT id FROM categories WHERE slug = 'kids-goods'), 5, true);

-- УРОВЕНЬ 3: Разделы игрушек
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Конструкторы', 'constructors', 3, (SELECT id FROM categories WHERE slug = 'toys'), 1, true),
('Куклы', 'dolls', 3, (SELECT id FROM categories WHERE slug = 'toys'), 2, true),
('Машинки', 'toy-cars', 3, (SELECT id FROM categories WHERE slug = 'toys'), 3, true),
('Развивающие игрушки', 'educational-toys', 3, (SELECT id FROM categories WHERE slug = 'toys'), 4, true);

-- ============================================
-- УРОВЕНЬ 1: Канцтовары и книги
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Канцтовары и книги', 'stationery-books', 1, NULL, 10, true);

-- УРОВЕНЬ 2: Подкатегории
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Канцелярские товары', 'stationery', 2, (SELECT id FROM categories WHERE slug = 'stationery-books'), 1, true),
('Книги', 'books', 2, (SELECT id FROM categories WHERE slug = 'stationery-books'), 2, true),
('Учебная литература', 'textbooks', 2, (SELECT id FROM categories WHERE slug = 'stationery-books'), 3, true);

-- УРОВЕНЬ 3: Разделы канцтоваров
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Тетради и блокноты', 'notebooks', 3, (SELECT id FROM categories WHERE slug = 'stationery'), 1, true),
('Письменные принадлежности', 'writing-supplies', 3, (SELECT id FROM categories WHERE slug = 'stationery'), 2, true),
('Папки и файлы', 'folders-files', 3, (SELECT id FROM categories WHERE slug = 'stationery'), 3, true);

-- ============================================
-- УСЛУГИ (для фильтра is_service)
-- ============================================
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Услуги', 'services', 1, NULL, 100, true);

-- УРОВЕНЬ 2: Подкатегории услуг
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Ремонт и строительство', 'repair-construction-services', 2, (SELECT id FROM categories WHERE slug = 'services'), 1, true),
('Красота и здоровье', 'beauty-health-services', 2, (SELECT id FROM categories WHERE slug = 'services'), 2, true),
('Транспортные услуги', 'transport-services', 2, (SELECT id FROM categories WHERE slug = 'services'), 3, true),
('Бытовые услуги', 'household-services', 2, (SELECT id FROM categories WHERE slug = 'services'), 4, true),
('Обучение', 'education-services', 2, (SELECT id FROM categories WHERE slug = 'services'), 5, true);

-- УРОВЕНЬ 3: Разделы услуг ремонта
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Ремонт квартир', 'apartment-repair', 3, (SELECT id FROM categories WHERE slug = 'repair-construction-services'), 1, true),
('Электромонтажные работы', 'electrical-work', 3, (SELECT id FROM categories WHERE slug = 'repair-construction-services'), 2, true),
('Сантехнические работы', 'plumbing-work', 3, (SELECT id FROM categories WHERE slug = 'repair-construction-services'), 3, true),
('Отделочные работы', 'finishing-work', 3, (SELECT id FROM categories WHERE slug = 'repair-construction-services'), 4, true);

-- УРОВЕНЬ 3: Разделы красоты
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Парикмахерские услуги', 'hairdressing', 3, (SELECT id FROM categories WHERE slug = 'beauty-health-services'), 1, true),
('Маникюр и педикюр', 'manicure-pedicure', 3, (SELECT id FROM categories WHERE slug = 'beauty-health-services'), 2, true),
('Косметологические услуги', 'cosmetology', 3, (SELECT id FROM categories WHERE slug = 'beauty-health-services'), 3, true),
('Массаж', 'massage', 3, (SELECT id FROM categories WHERE slug = 'beauty-health-services'), 4, true);

-- УРОВЕНЬ 3: Разделы транспортных услуг
INSERT INTO categories (name, slug, level, parent_id, sort_order, is_active) VALUES
('Грузоперевозки', 'cargo-transport', 3, (SELECT id FROM categories WHERE slug = 'transport-services'), 1, true),
('Пассажирские перевозки', 'passenger-transport', 3, (SELECT id FROM categories WHERE slug = 'transport-services'), 2, true),
('Эвакуатор', 'tow-truck', 3, (SELECT id FROM categories WHERE slug = 'transport-services'), 3, true);

-- Проверка результатов
SELECT 'Всего городов:', COUNT(*) FROM cities;
SELECT 'Всего рынков:', COUNT(*) FROM markets;
SELECT 'Всего категорий:', COUNT(*) FROM categories;
SELECT 'Категорий уровня 1:', COUNT(*) FROM categories WHERE level = 1;
SELECT 'Категорий уровня 2:', COUNT(*) FROM categories WHERE level = 2;
SELECT 'Категорий уровня 3:', COUNT(*) FROM categories WHERE level = 3;
