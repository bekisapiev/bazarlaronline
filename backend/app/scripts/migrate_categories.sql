-- ============================================================
-- Миграция категорий: удаление старых и применение новых
-- Bazarlar Online - Полная структура категорий для Кыргызстана
-- Сгенерировано автоматически через Python
-- ============================================================

-- Устанавливаем кодировку UTF8 для корректной работы с кириллицей
SET client_encoding = 'UTF8';

BEGIN;

-- ШАГ 1: Отвязываем все продукты от категорий
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;

-- ШАГ 2: Отвязываем профили продавцов от категорий
UPDATE seller_profiles SET category_id = NULL WHERE category_id IS NOT NULL;

-- ШАГ 3: Удаляем все старые категории
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- ============================================================
-- УРОВЕНЬ 1: ОСНОВНЫЕ КАТЕГОРИИ
-- ============================================================

-- 1. ТОВАРЫ
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1, 'Товары', 'tovary', 1, 'shopping_bag', 0, true, NULL);

-- 2. УСЛУГИ
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (2, 'Услуги', 'uslugi', 1, 'work', 1, true, NULL);

-- ============================================================
-- УРОВЕНЬ 2 и 3: ТОВАРЫ
-- ============================================================

-- ЭЛЕКТРОНИКА (id: 10)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (10, 'Электроника', 'elektronika', 2, 'devices', 0, true, 1);

-- Подкатегории Электроника
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(1001, 'Телефоны и аксессуары', 'telefony-aksessuary', 3, NULL, 0, true, 10),
(1002, 'Ноутбуки и компьютеры', 'noutbuki-kompyutery', 3, NULL, 1, true, 10),
(1003, 'Планшеты и электронные книги', 'planshety-eknigi', 3, NULL, 2, true, 10),
(1004, 'ТВ, аудио, видео', 'tv-audio-video', 3, NULL, 3, true, 10),
(1005, 'Фото и видеокамеры', 'foto-videokamery', 3, NULL, 4, true, 10),
(1006, 'Игровые приставки', 'igrovye-pristavki', 3, NULL, 5, true, 10),
(1007, 'Техника для дома', 'tekhnika-dlya-doma', 3, NULL, 6, true, 10),
(1008, 'Климатическая техника', 'klimaticheskaya-tekhnika', 3, NULL, 7, true, 10),
(1009, 'Аксессуары и комплектующие', 'aksessuary-komplektuyushchie', 3, NULL, 8, true, 10),
(1010, 'Умная электроника', 'umnaya-elektronika', 3, NULL, 9, true, 10);

-- ОДЕЖДА И ОБУВЬ (id: 20)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (20, 'Одежда и обувь', 'odezhda-obuv', 2, 'checkroom', 1, true, 1);

-- Подкатегории Одежда и обувь
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2001, 'Женская одежда', 'zhenskaya-odezhda', 3, NULL, 0, true, 20),
(2002, 'Мужская одежда', 'muzhskaya-odezhda', 3, NULL, 1, true, 20),
(2003, 'Детская одежда', 'detskaya-odezhda', 3, NULL, 2, true, 20),
(2004, 'Женская обувь', 'zhenskaya-obuv', 3, NULL, 3, true, 20),
(2005, 'Мужская обувь', 'muzhskaya-obuv', 3, NULL, 4, true, 20),
(2006, 'Детская обувь', 'detskaya-obuv', 3, NULL, 5, true, 20),
(2007, 'Аксессуары', 'aksessuary', 3, NULL, 6, true, 20),
(2008, 'Сумки и чемоданы', 'sumki-chemodany', 3, NULL, 7, true, 20),
(2009, 'Украшения и бижутерия', 'ukrasheniya-bizhuteria', 3, NULL, 8, true, 20),
(2010, 'Часы', 'chasy', 3, NULL, 9, true, 20);

-- СПОРТ И ОТДЫХ (id: 30)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (30, 'Спорт и отдых', 'sport-otdykh', 2, 'sports_tennis', 2, true, 1);

-- Подкатегории Спорт и отдых
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(3001, 'Тренажеры', 'trenazhery', 3, NULL, 0, true, 30),
(3002, 'Велосипеды', 'velosipedy', 3, NULL, 1, true, 30),
(3003, 'Спортивная одежда и обувь', 'sportivnaya-odezhda-obuv', 3, NULL, 2, true, 30),
(3004, 'Туризм и кемпинг', 'turizm-kemping', 3, NULL, 3, true, 30),
(3005, 'Рыбалка и охота', 'rybalka-okhota', 3, NULL, 4, true, 30),
(3006, 'Зимний спорт', 'zimniy-sport', 3, NULL, 5, true, 30),
(3007, 'Водный спорт', 'vodnyy-sport', 3, NULL, 6, true, 30),
(3008, 'Единоборства', 'edinoborstva', 3, NULL, 7, true, 30),
(3009, 'Командные виды спорта', 'komandnye-vidy-sporta', 3, NULL, 8, true, 30),
(3010, 'Настольные игры', 'nastolnye-igry', 3, NULL, 9, true, 30);

-- КРАСОТА И ЗДОРОВЬЕ (id: 40)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (40, 'Красота и здоровье', 'krasota-zdorovie', 2, 'favorite', 3, true, 1);

-- Подкатегории Красота и здоровье
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(4001, 'Парфюмерия', 'parfyumeriya', 3, NULL, 0, true, 40),
(4002, 'Косметика', 'kosmetika', 3, NULL, 1, true, 40),
(4003, 'Уход за лицом', 'ukhod-za-litsom', 3, NULL, 2, true, 40),
(4004, 'Уход за телом', 'ukhod-za-telom', 3, NULL, 3, true, 40),
(4005, 'Уход за волосами', 'ukhod-za-volosami', 3, NULL, 4, true, 40),
(4006, 'Медицинская техника', 'meditsinskaya-tekhnika', 3, NULL, 5, true, 40),
(4007, 'БАДы и витамины', 'bady-vitaminy', 3, NULL, 6, true, 40),
(4008, 'Средства гигиены', 'sredstva-gigieny', 3, NULL, 7, true, 40),
(4009, 'Маникюр и педикюр', 'manikyur-pedikyur', 3, NULL, 8, true, 40),
(4010, 'Массажеры', 'massazhery', 3, NULL, 9, true, 40);

-- ДОМ И ИНТЕРЬЕР (id: 50)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (50, 'Дом и интерьер', 'dom-interer', 2, 'home', 4, true, 1);

-- Подкатегории Дом и интерьер
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(5001, 'Мебель', 'mebel', 3, NULL, 0, true, 50),
(5002, 'Текстиль и ковры', 'tekstil-kovry', 3, NULL, 1, true, 50),
(5003, 'Посуда и кухонные принадлежности', 'posuda-kukhonnye-prinadlezhnosti', 3, NULL, 2, true, 50),
(5004, 'Освещение и декор', 'osveshchenie-dekor', 3, NULL, 3, true, 50),
(5005, 'Хозяйственные товары', 'khozyaystvennye-tovary', 3, NULL, 4, true, 50),
(5006, 'Инструменты', 'instrumenty', 3, NULL, 5, true, 50),
(5007, 'Сад и огород', 'sad-ogorod', 3, NULL, 6, true, 50),
(5008, 'Товары для ремонта', 'tovary-dlya-remonta', 3, NULL, 7, true, 50),
(5009, 'Сантехника', 'santekhnika', 3, NULL, 8, true, 50),
(5010, 'Системы безопасности', 'sistemy-bezopasnosti', 3, NULL, 9, true, 50);

-- ДЕТСКИЕ ТОВАРЫ (id: 60)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (60, 'Детские товары', 'detskie-tovary', 2, 'child_care', 5, true, 1);

-- Подкатегории Детские товары
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(6001, 'Коляски и автокресла', 'kolyaski-avtokresla', 3, NULL, 0, true, 60),
(6002, 'Игрушки', 'igrushki', 3, NULL, 1, true, 60),
(6003, 'Детская мебель', 'detskaya-mebel', 3, NULL, 2, true, 60),
(6004, 'Детское питание', 'detskoe-pitanie', 3, NULL, 3, true, 60),
(6005, 'Товары для новорожденных', 'tovary-dlya-novorozhdennykh', 3, NULL, 4, true, 60),
(6006, 'Детская гигиена', 'detskaya-gigiena', 3, NULL, 5, true, 60),
(6007, 'Школьные товары', 'shkolnye-tovary', 3, NULL, 6, true, 60),
(6008, 'Развивающие игры', 'razvivayushchie-igry', 3, NULL, 7, true, 60),
(6009, 'Детский транспорт', 'detskiy-transport', 3, NULL, 8, true, 60),
(6010, 'Одежда для беременных', 'odezhda-dlya-beremennykh', 3, NULL, 9, true, 60);

-- КНИГИ И ХОББИ (id: 70)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (70, 'Книги и хобби', 'knigi-khobbi', 2, 'menu_book', 6, true, 1);

-- Подкатегории Книги и хобби
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(7001, 'Книги', 'knigi', 3, NULL, 0, true, 70),
(7002, 'Журналы и газеты', 'zhurnaly-gazety', 3, NULL, 1, true, 70),
(7003, 'Канцелярия', 'kantselyariya', 3, NULL, 2, true, 70),
(7004, 'Музыкальные инструменты', 'muzykalnye-instrumenty', 3, NULL, 3, true, 70),
(7005, 'Творчество и рукоделие', 'tvorchestvo-rukodelie', 3, NULL, 4, true, 70),
(7006, 'Коллекционирование', 'kollektsionirovanie', 3, NULL, 5, true, 70),
(7007, 'Антиквариат', 'antikvariat', 3, NULL, 6, true, 70),
(7008, 'Винил и аудиотехника', 'vinil-audiotekhnika', 3, NULL, 7, true, 70),
(7009, 'Фотография', 'fotografiya', 3, NULL, 8, true, 70),
(7010, 'Художественные материалы', 'khudozhestvennye-materialy', 3, NULL, 9, true, 70);

-- ПРОДУКТЫ ПИТАНИЯ (id: 80)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (80, 'Продукты питания', 'produkty-pitaniya', 2, 'restaurant', 7, true, 1);

-- Подкатегории Продукты питания
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(8001, 'Молочные продукты', 'molochnye-produkty', 3, NULL, 0, true, 80),
(8002, 'Мясо и птица', 'myaso-ptitsa', 3, NULL, 1, true, 80),
(8003, 'Рыба и морепродукты', 'ryba-moreprodukty', 3, NULL, 2, true, 80),
(8004, 'Хлебобулочные изделия', 'khlebobulochnye-izdeliya', 3, NULL, 3, true, 80),
(8005, 'Кондитерские изделия', 'konditerskie-izdeliya', 3, NULL, 4, true, 80),
(8006, 'Фрукты и овощи', 'frukty-ovoshchi', 3, NULL, 5, true, 80),
(8007, 'Бакалея', 'bakaleya', 3, NULL, 6, true, 80),
(8008, 'Напитки', 'napitki', 3, NULL, 7, true, 80),
(8009, 'Органические продукты', 'organicheskie-produkty', 3, NULL, 8, true, 80),
(8010, 'Готовая еда', 'gotovaya-eda', 3, NULL, 9, true, 80);

-- АВТО И МОТО (id: 90)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (90, 'Авто и мото', 'avto-moto', 2, 'directions_car', 8, true, 1);

-- Подкатегории Авто и мото
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(9001, 'Легковые автомобили', 'legkovye-avtomobili', 3, NULL, 0, true, 90),
(9002, 'Грузовые автомобили', 'gruzovye-avtomobili', 3, NULL, 1, true, 90),
(9003, 'Мотоциклы и мототехника', 'mototsikly-mototekhnika', 3, NULL, 2, true, 90),
(9004, 'Автозапчасти', 'avtozapchasti', 3, NULL, 3, true, 90),
(9005, 'Шины и диски', 'shiny-diski', 3, NULL, 4, true, 90),
(9006, 'Автоэлектроника', 'avtoelektronika', 3, NULL, 5, true, 90),
(9007, 'Автоаксессуары', 'avtoaksessuary', 3, NULL, 6, true, 90),
(9008, 'Автохимия и масла', 'avtokhimiya-masla', 3, NULL, 7, true, 90),
(9009, 'Прицепы и спецтехника', 'pritsey-spetstekhnika', 3, NULL, 8, true, 90),
(9010, 'Велосипеды и самокаты', 'velosipedy-samokaty', 3, NULL, 9, true, 90);

-- НЕДВИЖИМОСТЬ (id: 100)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (100, 'Недвижимость', 'nedvizhimost', 2, 'apartment', 9, true, 1);

-- Подкатегории Недвижимость
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(10001, 'Квартиры', 'kvartiry', 3, NULL, 0, true, 100),
(10002, 'Дома и дачи', 'doma-dachi', 3, NULL, 1, true, 100),
(10003, 'Коммерческая недвижимость', 'kommercheskaya-nedvizhimost', 3, NULL, 2, true, 100),
(10004, 'Земельные участки', 'zemelnye-uchastki', 3, NULL, 3, true, 100),
(10005, 'Гаражи и парковки', 'garazhi-parkovki', 3, NULL, 4, true, 100),
(10006, 'Аренда квартир', 'arenda-kvartir', 3, NULL, 5, true, 100),
(10007, 'Аренда домов', 'arenda-domov', 3, NULL, 6, true, 100),
(10008, 'Аренда коммерческой недвижимости', 'arenda-kommercheskoy-nedvizhimosti', 3, NULL, 7, true, 100),
(10009, 'Посуточная аренда', 'posutochnaya-arenda', 3, NULL, 8, true, 100),
(10010, 'Зарубежная недвижимость', 'zarubezhnaya-nedvizhimost', 3, NULL, 9, true, 100);

-- ЖИВОТНЫЕ (id: 120)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (120, 'Животные', 'zhivotnye', 2, 'pets', 10, true, 1);

-- Подкатегории Животные
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(12001, 'Собаки', 'sobaki', 3, NULL, 0, true, 120),
(12002, 'Кошки', 'koshki', 3, NULL, 1, true, 120),
(12003, 'Птицы', 'ptitsy', 3, NULL, 2, true, 120),
(12004, 'Аквариумные рыбки', 'akvariumnye-rybki', 3, NULL, 3, true, 120),
(12005, 'Грызуны', 'gryzuny', 3, NULL, 4, true, 120),
(12006, 'Сельскохозяйственные животные', 'selskokhozyaystvennye-zhivotnye', 3, NULL, 5, true, 120),
(12007, 'Экзотические животные', 'ekzoticheskie-zhivotnye', 3, NULL, 6, true, 120),
(12008, 'Товары для животных', 'tovary-dlya-zhivotnykh', 3, NULL, 7, true, 120),
(12009, 'Корма для животных', 'korma-dlya-zhivotnykh', 3, NULL, 8, true, 120),
(12010, 'Ветеринария', 'veterinariya', 3, NULL, 9, true, 120);

-- РАБОТА (id: 130)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (130, 'Работа', 'rabota', 2, 'work', 11, true, 1);

-- Подкатегории Работа
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(13001, 'Вакансии', 'vakansii', 3, NULL, 0, true, 130),
(13002, 'Резюме', 'rezyume', 3, NULL, 1, true, 130),
(13003, 'Подработка', 'podrabotka', 3, NULL, 2, true, 130),
(13004, 'Стажировки', 'stazhirovki', 3, NULL, 3, true, 130),
(13005, 'Удаленная работа', 'udalennaya-rabota', 3, NULL, 4, true, 130),
(13006, 'Вахтовый метод', 'vakhtovyy-metod', 3, NULL, 5, true, 130),
(13007, 'Работа за рубежом', 'rabota-za-rubezhom', 3, NULL, 6, true, 130),
(13008, 'Волонтерство', 'volonterstvo', 3, NULL, 7, true, 130),
(13009, 'Бизнес и партнерство', 'biznes-partnerstvo', 3, NULL, 8, true, 130),
(13010, 'Образование и курсы', 'obrazovanie-kursy', 3, NULL, 9, true, 130);

-- ============================================================
-- УРОВЕНЬ 2 и 3: УСЛУГИ
-- ============================================================

-- IT И ИНТЕРНЕТ (id: 210)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (210, 'IT и интернет', 'it-internet', 2, 'computer', 0, true, 2);

-- Подкатегории IT и интернет
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2101, 'Разработка сайтов', 'razrabotka-saytov', 3, NULL, 0, true, 210),
(2102, 'Разработка мобильных приложений', 'razrabotka-mobilnykh-prilozheniy', 3, NULL, 1, true, 210),
(2103, 'Дизайн и графика', 'dizayn-grafika', 3, NULL, 2, true, 210),
(2104, 'SEO и продвижение', 'seo-prodvizhenie', 3, NULL, 3, true, 210),
(2105, 'Настройка рекламы', 'nastroyka-reklamy', 3, NULL, 4, true, 210),
(2106, 'Администрирование серверов', 'administrirovanie-serverov', 3, NULL, 5, true, 210),
(2107, 'Ремонт компьютеров', 'remont-kompyuterov', 3, NULL, 6, true, 210),
(2108, 'IT-консалтинг', 'it-konsalting', 3, NULL, 7, true, 210),
(2109, 'Создание игр', 'sozdanie-igr', 3, NULL, 8, true, 210),
(2110, 'Обучение IT', 'obuchenie-it', 3, NULL, 9, true, 210);

-- СТРОИТЕЛЬСТВО И РЕМОНТ (id: 220)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (220, 'Строительство и ремонт', 'stroitelstvo-remont', 2, 'construction', 1, true, 2);

-- Подкатегории Строительство и ремонт
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2201, 'Ремонт квартир', 'remont-kvartir', 3, NULL, 0, true, 220),
(2202, 'Ремонт домов', 'remont-domov', 3, NULL, 1, true, 220),
(2203, 'Отделочные работы', 'otdelochnye-raboty', 3, NULL, 2, true, 220),
(2204, 'Сантехнические работы', 'santekhnicheskie-raboty', 3, NULL, 3, true, 220),
(2205, 'Электромонтажные работы', 'elektromontazhnye-raboty', 3, NULL, 4, true, 220),
(2206, 'Кровельные работы', 'krovelnye-raboty', 3, NULL, 5, true, 220),
(2207, 'Фасадные работы', 'fasadnye-raboty', 3, NULL, 6, true, 220),
(2208, 'Установка окон и дверей', 'ustanovka-okon-dverey', 3, NULL, 7, true, 220),
(2209, 'Ландшафтный дизайн', 'landshaftnyy-dizayn', 3, NULL, 8, true, 220),
(2210, 'Снос и демонтаж', 'snos-demontazh', 3, NULL, 9, true, 220);

-- БЫТОВЫЕ УСЛУГИ (id: 230)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (230, 'Бытовые услуги', 'bytovye-uslugi', 2, 'home_repair_service', 2, true, 2);

-- Подкатегории Бытовые услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2301, 'Уборка помещений', 'uborka-pomeshcheniy', 3, NULL, 0, true, 230),
(2302, 'Химчистка', 'khimchistka', 3, NULL, 1, true, 230),
(2303, 'Ремонт бытовой техники', 'remont-bytovoy-tekhniki', 3, NULL, 2, true, 230),
(2304, 'Ремонт мебели', 'remont-mebeli', 3, NULL, 3, true, 230),
(2305, 'Ремонт одежды и обуви', 'remont-odezhdy-obuvi', 3, NULL, 4, true, 230),
(2306, 'Грузоперевозки', 'gruzoperevozki', 3, NULL, 5, true, 230),
(2307, 'Переезды', 'pereezdy', 3, NULL, 6, true, 230),
(2308, 'Курьерские услуги', 'kurerskie-uslugi', 3, NULL, 7, true, 230),
(2309, 'Мастер на час', 'master-na-chas', 3, NULL, 8, true, 230),
(2310, 'Сборка мебели', 'sborka-mebeli', 3, NULL, 9, true, 230);

-- КРАСОТА И ЗДОРОВЬЕ (id: 240)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (240, 'Красота и здоровье', 'krasota-zdorovie-uslugi', 2, 'spa', 3, true, 2);

-- Подкатегории Красота и здоровье
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2401, 'Парикмахерские услуги', 'parikmaherskie-uslugi', 3, NULL, 0, true, 240),
(2402, 'Маникюр и педикюр', 'manikyur-pedikyur-uslugi', 3, NULL, 1, true, 240),
(2403, 'Косметология', 'kosmetologiya', 3, NULL, 2, true, 240),
(2404, 'Массаж', 'massazh', 3, NULL, 3, true, 240),
(2405, 'Татуаж и перманентный макияж', 'tatuazh-permanentnyy-makiyazh', 3, NULL, 4, true, 240),
(2406, 'Эпиляция', 'epilyatsiya', 3, NULL, 5, true, 240),
(2407, 'Визаж и макияж', 'vizazh-makiyazh', 3, NULL, 6, true, 240),
(2408, 'SPA-процедуры', 'spa-protsedury', 3, NULL, 7, true, 240),
(2409, 'Стоматология', 'stomatologiya', 3, NULL, 8, true, 240),
(2410, 'Фитнес и тренировки', 'fitnes-trenirovki', 3, NULL, 9, true, 240);

-- ОБРАЗОВАНИЕ И КУРСЫ (id: 250)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (250, 'Образование и курсы', 'obrazovanie-kursy', 2, 'school', 4, true, 2);

-- Подкатегории Образование и курсы
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2501, 'Репетиторы', 'repetitory', 3, NULL, 0, true, 250),
(2502, 'Курсы иностранных языков', 'kursy-inostrannykh-yazykov', 3, NULL, 1, true, 250),
(2503, 'Компьютерные курсы', 'kompyuternye-kursy', 3, NULL, 2, true, 250),
(2504, 'Бизнес-тренинги', 'biznes-treningi', 3, NULL, 3, true, 250),
(2505, 'Курсы красоты', 'kursy-krasoty', 3, NULL, 4, true, 250),
(2506, 'Музыкальные школы', 'muzykalnye-shkoly', 3, NULL, 5, true, 250),
(2507, 'Танцы и хореография', 'tantsy-khoreografiya', 3, NULL, 6, true, 250),
(2508, 'Художественные курсы', 'khudozhestvennye-kursy', 3, NULL, 7, true, 250),
(2509, 'Курсы вождения', 'kursy-vozhdeniya', 3, NULL, 8, true, 250),
(2510, 'Профессиональные курсы', 'professionalnye-kursy', 3, NULL, 9, true, 250);

-- ФИНАНСОВЫЕ УСЛУГИ (id: 260)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (260, 'Финансовые услуги', 'finansovye-uslugi', 2, 'account_balance', 5, true, 2);

-- Подкатегории Финансовые услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2601, 'Бухгалтерские услуги', 'bukhgalterskie-uslugi', 3, NULL, 0, true, 260),
(2602, 'Аудиторские услуги', 'auditorskie-uslugi', 3, NULL, 1, true, 260),
(2603, 'Юридические услуги', 'yuridicheskie-uslugi', 3, NULL, 2, true, 260),
(2604, 'Кредиты и займы', 'kredity-zaymy', 3, NULL, 3, true, 260),
(2605, 'Страхование', 'strakhovanie', 3, NULL, 4, true, 260),
(2606, 'Инвестиционный консалтинг', 'investitsionnyy-konsalting', 3, NULL, 5, true, 260),
(2607, 'Налоговое консультирование', 'nalogovoe-konsultirovanie', 3, NULL, 6, true, 260),
(2608, 'Регистрация бизнеса', 'registratsiya-biznesa', 3, NULL, 7, true, 260),
(2609, 'Финансовый анализ', 'finansovyy-analiz', 3, NULL, 8, true, 260),
(2610, 'Коллекторские услуги', 'kollektorskie-uslugi', 3, NULL, 9, true, 260);

-- АВТО УСЛУГИ (id: 270)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (270, 'Авто услуги', 'avto-uslugi', 2, 'car_repair', 6, true, 2);

-- Подкатегории Авто услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2701, 'Ремонт автомобилей', 'remont-avtomobiley', 3, NULL, 0, true, 270),
(2702, 'Кузовной ремонт', 'kuzovnoy-remont', 3, NULL, 1, true, 270),
(2703, 'Покраска автомобилей', 'pokraska-avtomobiley', 3, NULL, 2, true, 270),
(2704, 'Автомойка', 'avtomoyka', 3, NULL, 3, true, 270),
(2705, 'Шиномонтаж', 'shinomontazh', 3, NULL, 4, true, 270),
(2706, 'Тонировка стекол', 'tonirovka-stekol', 3, NULL, 5, true, 270),
(2707, 'Установка сигнализаций', 'ustanovka-signalizatsiy', 3, NULL, 6, true, 270),
(2708, 'Диагностика автомобилей', 'diagnostika-avtomobiley', 3, NULL, 7, true, 270),
(2709, 'Эвакуация автомобилей', 'evakuatsiya-avtomobiley', 3, NULL, 8, true, 270),
(2710, 'Прокат автомобилей', 'prokat-avtomobiley', 3, NULL, 9, true, 270);

-- ОРГАНИЗАЦИЯ МЕРОПРИЯТИЙ (id: 280)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (280, 'Организация мероприятий', 'organizatsiya-meropriyatiy', 2, 'celebration', 7, true, 2);

-- Подкатегории Организация мероприятий
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2801, 'Свадьбы', 'svadby', 3, NULL, 0, true, 280),
(2802, 'Дни рождения', 'dni-rozhdeniya', 3, NULL, 1, true, 280),
(2803, 'Корпоративные мероприятия', 'korporativnye-meropriyatiya', 3, NULL, 2, true, 280),
(2804, 'Юбилеи', 'yubilei', 3, NULL, 3, true, 280),
(2805, 'Детские праздники', 'detskie-prazdniki', 3, NULL, 4, true, 280),
(2806, 'Фото и видеосъемка', 'foto-videosemka', 3, NULL, 5, true, 280),
(2807, 'Ведущие и тамада', 'vedushchie-tamada', 3, NULL, 6, true, 280),
(2808, 'Музыканты и DJ', 'muzykanty-dj', 3, NULL, 7, true, 280),
(2809, 'Аренда залов', 'arenda-zalov', 3, NULL, 8, true, 280),
(2810, 'Кейтеринг', 'keytering', 3, NULL, 9, true, 280);

-- ФОТО И ВИДЕО УСЛУГИ (id: 290)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (290, 'Фото и видео услуги', 'foto-video-uslugi', 2, 'photo_camera', 8, true, 2);

-- Подкатегории Фото и видео услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2901, 'Свадебная фотосъемка', 'svadebnaya-fotosemka', 3, NULL, 0, true, 290),
(2902, 'Портретная фотосъемка', 'portretnaya-fotosemka', 3, NULL, 1, true, 290),
(2903, 'Предметная фотосъемка', 'predmetnaya-fotosemka', 3, NULL, 2, true, 290),
(2904, 'Видеосъемка мероприятий', 'videosemka-meropriyatiy', 3, NULL, 3, true, 290),
(2905, 'Аэросъемка', 'aerosemka', 3, NULL, 4, true, 290),
(2906, 'Видеомонтаж', 'videomontazh', 3, NULL, 5, true, 290),
(2907, 'Обработка фотографий', 'obrabotka-fotografiy', 3, NULL, 6, true, 290),
(2908, 'Студийная съемка', 'studiynaya-semka', 3, NULL, 7, true, 290),
(2909, 'Семейная фотосъемка', 'semeynaya-fotosemka', 3, NULL, 8, true, 290),
(2910, 'Рекламная съемка', 'reklamnaya-semka', 3, NULL, 9, true, 290);

-- ТУРИЗМ И ПУТЕШЕСТВИЯ (id: 300)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (300, 'Туризм и путешествия', 'turizm-puteshestviya', 2, 'flight', 9, true, 2);

-- Подкатегории Туризм и путешествия
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(3001, 'Туристические туры', 'turisticheskie-tury', 3, NULL, 0, true, 300),
(3002, 'Авиабилеты', 'aviabilety', 3, NULL, 1, true, 300),
(3003, 'Гостиницы и отели', 'gostinitsy-oteli', 3, NULL, 2, true, 300),
(3004, 'Визовая поддержка', 'vizovaya-podderzhka', 3, NULL, 3, true, 300),
(3005, 'Экскурсии', 'ekskursii', 3, NULL, 4, true, 300),
(3006, 'Трансфер', 'transfer', 3, NULL, 5, true, 300),
(3007, 'Туристическое страхование', 'turisticheskoe-strakhovanie', 3, NULL, 6, true, 300),
(3008, 'Круизы', 'kruizy', 3, NULL, 7, true, 300),
(3009, 'Аренда жилья за рубежом', 'arenda-zhilya-za-rubezhom', 3, NULL, 8, true, 300),
(3010, 'Горящие туры', 'goryashchie-tury', 3, NULL, 9, true, 300);

-- УСЛУГИ ДЛЯ ЖИВОТНЫХ (id: 310)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (310, 'Услуги для животных', 'uslugi-dlya-zhivotnykh', 2, 'pets', 10, true, 2);

-- Подкатегории Услуги для животных
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(3101, 'Ветеринарные услуги', 'veterinarnye-uslugi', 3, NULL, 0, true, 310),
(3102, 'Груминг', 'gruming', 3, NULL, 1, true, 310),
(3103, 'Передержка животных', 'perederzyka-zhivotnykh', 3, NULL, 2, true, 310),
(3104, 'Дрессировка', 'dressirovka', 3, NULL, 3, true, 310),
(3105, 'Выгул собак', 'vygul-sobak', 3, NULL, 4, true, 310),
(3106, 'Вязка животных', 'vyazka-zhivotnykh', 3, NULL, 5, true, 310),
(3107, 'Зоотакси', 'zootaksi', 3, NULL, 6, true, 310),
(3108, 'Зоогостиницы', 'zoogostinitsy', 3, NULL, 7, true, 310),
(3109, 'Стерилизация и кастрация', 'sterilizatsiya-kastratsiya', 3, NULL, 8, true, 310),
(3110, 'Ветеринарная аптека', 'veterinarnaya-apteka', 3, NULL, 9, true, 310);

-- РЕКЛАМА И МАРКЕТИНГ (id: 320)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (320, 'Реклама и маркетинг', 'reklama-marketing', 2, 'campaign', 11, true, 2);

-- Подкатегории Реклама и маркетинг
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(3201, 'Интернет-реклама', 'internet-reklama', 3, NULL, 0, true, 320),
(3202, 'Наружная реклама', 'naruzhnaya-reklama', 3, NULL, 1, true, 320),
(3203, 'Полиграфия', 'poligrafiya', 3, NULL, 2, true, 320),
(3204, 'SMM-продвижение', 'smm-prodvizhenie', 3, NULL, 3, true, 320),
(3205, 'Создание логотипов', 'sozdanie-logotipov', 3, NULL, 4, true, 320),
(3206, 'Брендинг', 'brending', 3, NULL, 5, true, 320),
(3207, 'Копирайтинг', 'kopiraiting', 3, NULL, 6, true, 320),
(3208, 'PR-услуги', 'pr-uslugi', 3, NULL, 7, true, 320),
(3209, 'Медиапланирование', 'mediaplanirovanie', 3, NULL, 8, true, 320),
(3210, 'Email-маркетинг', 'email-marketing', 3, NULL, 9, true, 320);

-- ============================================================
-- Обновляем sequence и показываем статистику
-- ============================================================

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories) + 1);

SELECT
    level,
    COUNT(*) as count
FROM categories
GROUP BY level
ORDER BY level;

COMMIT;

-- Миграция завершена успешно!