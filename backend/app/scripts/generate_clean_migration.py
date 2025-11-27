#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор SQL файла для миграции категорий
Создает чистый SQL без ошибок нумерации
"""

# Структура категорий
CATEGORIES = {
    "products": {
        "id": 1,
        "name": "Товары",
        "slug": "tovary",
        "icon": "shopping_bag",
        "children": [
            {
                "id": 10,
                "name": "Электроника",
                "slug": "elektronika",
                "icon": "devices",
                "subcategories": [
                    ("Телефоны и аксессуары", "telefony-aksessuary"),
                    ("Ноутбуки и компьютеры", "noutbuki-kompyutery"),
                    ("Планшеты и электронные книги", "planshety-eknigi"),
                    ("ТВ, аудио, видео", "tv-audio-video"),
                    ("Фото и видеокамеры", "foto-videokamery"),
                    ("Игровые приставки", "igrovye-pristavki"),
                    ("Техника для дома", "tekhnika-dlya-doma"),
                    ("Климатическая техника", "klimaticheskaya-tekhnika"),
                    ("Аксессуары и комплектующие", "aksessuary-komplektuyushchie"),
                    ("Умная электроника", "umnaya-elektronika"),
                ]
            },
            {
                "id": 20,
                "name": "Одежда и обувь",
                "slug": "odezhda-obuv",
                "icon": "checkroom",
                "subcategories": [
                    ("Женская одежда", "zhenskaya-odezhda"),
                    ("Мужская одежда", "muzhskaya-odezhda"),
                    ("Детская одежда", "detskaya-odezhda"),
                    ("Женская обувь", "zhenskaya-obuv"),
                    ("Мужская обувь", "muzhskaya-obuv"),
                    ("Детская обувь", "detskaya-obuv"),
                    ("Аксессуары", "aksessuary"),
                    ("Сумки и чемоданы", "sumki-chemodany"),
                    ("Украшения и бижутерия", "ukrasheniya-bizhuteria"),
                    ("Часы", "chasy"),
                ]
            },
            {
                "id": 30,
                "name": "Спорт и отдых",
                "slug": "sport-otdykh",
                "icon": "sports_tennis",
                "subcategories": [
                    ("Тренажеры", "trenazhery"),
                    ("Велосипеды", "velosipedy"),
                    ("Спортивная одежда и обувь", "sportivnaya-odezhda-obuv"),
                    ("Туризм и кемпинг", "turizm-kemping"),
                    ("Рыбалка и охота", "rybalka-okhota"),
                    ("Зимний спорт", "zimniy-sport"),
                    ("Водный спорт", "vodnyy-sport"),
                    ("Единоборства", "edinoborstva"),
                    ("Командные виды спорта", "komandnye-vidy-sporta"),
                    ("Настольные игры", "nastolnye-igry"),
                ]
            },
            {
                "id": 40,
                "name": "Красота и здоровье",
                "slug": "krasota-zdorovie",
                "icon": "favorite",
                "subcategories": [
                    ("Парфюмерия", "parfyumeriya"),
                    ("Косметика", "kosmetika"),
                    ("Уход за лицом", "ukhod-za-litsom"),
                    ("Уход за телом", "ukhod-za-telom"),
                    ("Уход за волосами", "ukhod-za-volosami"),
                    ("Медицинская техника", "meditsinskaya-tekhnika"),
                    ("БАДы и витамины", "bady-vitaminy"),
                    ("Средства гигиены", "sredstva-gigieny"),
                    ("Маникюр и педикюр", "manikyur-pedikyur"),
                    ("Массажеры", "massazhery"),
                ]
            },
            {
                "id": 50,
                "name": "Дом и интерьер",
                "slug": "dom-interer",
                "icon": "home",
                "subcategories": [
                    ("Мебель", "mebel"),
                    ("Текстиль и ковры", "tekstil-kovry"),
                    ("Посуда и кухонные принадлежности", "posuda-kukhonnye-prinadlezhnosti"),
                    ("Освещение и декор", "osveshchenie-dekor"),
                    ("Хозяйственные товары", "khozyaystvennye-tovary"),
                    ("Инструменты", "instrumenty"),
                    ("Сад и огород", "sad-ogorod"),
                    ("Товары для ремонта", "tovary-dlya-remonta"),
                    ("Сантехника", "santekhnika"),
                    ("Системы безопасности", "sistemy-bezopasnosti"),
                ]
            },
            {
                "id": 60,
                "name": "Детские товары",
                "slug": "detskie-tovary",
                "icon": "child_care",
                "subcategories": [
                    ("Коляски и автокресла", "kolyaski-avtokresla"),
                    ("Игрушки", "igrushki"),
                    ("Детская мебель", "detskaya-mebel"),
                    ("Детское питание", "detskoe-pitanie"),
                    ("Товары для новорожденных", "tovary-dlya-novorozhdennykh"),
                    ("Детская гигиена", "detskaya-gigiena"),
                    ("Школьные товары", "shkolnye-tovary"),
                    ("Развивающие игры", "razvivayushchie-igry"),
                    ("Детский транспорт", "detskiy-transport"),
                    ("Одежда для беременных", "odezhda-dlya-beremennykh"),
                ]
            },
            {
                "id": 70,
                "name": "Книги и хобби",
                "slug": "knigi-khobbi",
                "icon": "menu_book",
                "subcategories": [
                    ("Книги", "knigi"),
                    ("Журналы и газеты", "zhurnaly-gazety"),
                    ("Канцелярия", "kantselyariya"),
                    ("Музыкальные инструменты", "muzykalnye-instrumenty"),
                    ("Творчество и рукоделие", "tvorchestvo-rukodelie"),
                    ("Коллекционирование", "kollektsionirovanie"),
                    ("Антиквариат", "antikvariat"),
                    ("Винил и аудиотехника", "vinil-audiotekhnika"),
                    ("Фотография", "fotografiya"),
                    ("Художественные материалы", "khudozhestvennye-materialy"),
                ]
            },
            {
                "id": 80,
                "name": "Продукты питания",
                "slug": "produkty-pitaniya",
                "icon": "restaurant",
                "subcategories": [
                    ("Молочные продукты", "molochnye-produkty"),
                    ("Мясо и птица", "myaso-ptitsa"),
                    ("Рыба и морепродукты", "ryba-moreprodukty"),
                    ("Хлебобулочные изделия", "khlebobulochnye-izdeliya"),
                    ("Кондитерские изделия", "konditerskie-izdeliya"),
                    ("Фрукты и овощи", "frukty-ovoshchi"),
                    ("Бакалея", "bakaleya"),
                    ("Напитки", "napitki"),
                    ("Органические продукты", "organicheskie-produkty"),
                    ("Готовая еда", "gotovaya-eda"),
                ]
            },
            {
                "id": 90,
                "name": "Авто и мото",
                "slug": "avto-moto",
                "icon": "directions_car",
                "subcategories": [
                    ("Легковые автомобили", "legkovye-avtomobili"),
                    ("Грузовые автомобили", "gruzovye-avtomobili"),
                    ("Мотоциклы и мототехника", "mototsikly-mototekhnika"),
                    ("Автозапчасти", "avtozapchasti"),
                    ("Шины и диски", "shiny-diski"),
                    ("Автоэлектроника", "avtoelektronika"),
                    ("Автоаксессуары", "avtoaksessuary"),
                    ("Автохимия и масла", "avtokhimiya-masla"),
                    ("Прицепы и спецтехника", "pritsey-spetstekhnika"),
                    ("Велосипеды и самокаты", "velosipedy-samokaty"),
                ]
            },
            {
                "id": 100,
                "name": "Недвижимость",
                "slug": "nedvizhimost",
                "icon": "apartment",
                "subcategories": [
                    ("Квартиры", "kvartiry"),
                    ("Дома и дачи", "doma-dachi"),
                    ("Коммерческая недвижимость", "kommercheskaya-nedvizhimost"),
                    ("Земельные участки", "zemelnye-uchastki"),
                    ("Гаражи и парковки", "garazhi-parkovki"),
                    ("Аренда квартир", "arenda-kvartir"),
                    ("Аренда домов", "arenda-domov"),
                    ("Аренда коммерческой недвижимости", "arenda-kommercheskoy-nedvizhimosti"),
                    ("Посуточная аренда", "posutochnaya-arenda"),
                    ("Зарубежная недвижимость", "zarubezhnaya-nedvizhimost"),
                ]
            },
            {
                "id": 120,
                "name": "Животные",
                "slug": "zhivotnye",
                "icon": "pets",
                "subcategories": [
                    ("Собаки", "sobaki"),
                    ("Кошки", "koshki"),
                    ("Птицы", "ptitsy"),
                    ("Аквариумные рыбки", "akvariumnye-rybki"),
                    ("Грызуны", "gryzuny"),
                    ("Сельскохозяйственные животные", "selskokhozyaystvennye-zhivotnye"),
                    ("Экзотические животные", "ekzoticheskie-zhivotnye"),
                    ("Товары для животных", "tovary-dlya-zhivotnykh"),
                    ("Корма для животных", "korma-dlya-zhivotnykh"),
                    ("Ветеринария", "veterinariya"),
                ]
            },
            {
                "id": 130,
                "name": "Работа",
                "slug": "rabota",
                "icon": "work",
                "subcategories": [
                    ("Вакансии", "vakansii"),
                    ("Резюме", "rezyume"),
                    ("Подработка", "podrabotka"),
                    ("Стажировки", "stazhirovki"),
                    ("Удаленная работа", "udalennaya-rabota"),
                    ("Вахтовый метод", "vakhtovyy-metod"),
                    ("Работа за рубежом", "rabota-za-rubezhom"),
                    ("Волонтерство", "volonterstvo"),
                    ("Бизнес и партнерство", "biznes-partnerstvo"),
                    ("Образование и курсы", "obrazovanie-kursy"),
                ]
            },
        ]
    },
    "services": {
        "id": 2,
        "name": "Услуги",
        "slug": "uslugi",
        "icon": "work",
        "children": [
            {
                "id": 210,
                "name": "IT и интернет",
                "slug": "it-internet",
                "icon": "computer",
                "subcategories": [
                    ("Разработка сайтов", "razrabotka-saytov"),
                    ("Разработка мобильных приложений", "razrabotka-mobilnykh-prilozheniy"),
                    ("Дизайн и графика", "dizayn-grafika"),
                    ("SEO и продвижение", "seo-prodvizhenie"),
                    ("Настройка рекламы", "nastroyka-reklamy"),
                    ("Администрирование серверов", "administrirovanie-serverov"),
                    ("Ремонт компьютеров", "remont-kompyuterov"),
                    ("IT-консалтинг", "it-konsalting"),
                    ("Создание игр", "sozdanie-igr"),
                    ("Обучение IT", "obuchenie-it"),
                ]
            },
            {
                "id": 220,
                "name": "Строительство и ремонт",
                "slug": "stroitelstvo-remont",
                "icon": "construction",
                "subcategories": [
                    ("Ремонт квартир", "remont-kvartir"),
                    ("Ремонт домов", "remont-domov"),
                    ("Отделочные работы", "otdelochnye-raboty"),
                    ("Сантехнические работы", "santekhnicheskie-raboty"),
                    ("Электромонтажные работы", "elektromontazhnye-raboty"),
                    ("Кровельные работы", "krovelnye-raboty"),
                    ("Фасадные работы", "fasadnye-raboty"),
                    ("Установка окон и дверей", "ustanovka-okon-dverey"),
                    ("Ландшафтный дизайн", "landshaftnyy-dizayn"),
                    ("Снос и демонтаж", "snos-demontazh"),
                ]
            },
            {
                "id": 230,
                "name": "Бытовые услуги",
                "slug": "bytovye-uslugi",
                "icon": "home_repair_service",
                "subcategories": [
                    ("Уборка помещений", "uborka-pomeshcheniy"),
                    ("Химчистка", "khimchistka"),
                    ("Ремонт бытовой техники", "remont-bytovoy-tekhniki"),
                    ("Ремонт мебели", "remont-mebeli"),
                    ("Ремонт одежды и обуви", "remont-odezhdy-obuvi"),
                    ("Грузоперевозки", "gruzoperevozki"),
                    ("Переезды", "pereezdy"),
                    ("Курьерские услуги", "kurerskie-uslugi"),
                    ("Мастер на час", "master-na-chas"),
                    ("Сборка мебели", "sborka-mebeli"),
                ]
            },
            {
                "id": 240,
                "name": "Красота и здоровье",
                "slug": "krasota-zdorovie-uslugi",
                "icon": "spa",
                "subcategories": [
                    ("Парикмахерские услуги", "parikmaherskie-uslugi"),
                    ("Маникюр и педикюр", "manikyur-pedikyur-uslugi"),
                    ("Косметология", "kosmetologiya"),
                    ("Массаж", "massazh"),
                    ("Татуаж и перманентный макияж", "tatuazh-permanentnyy-makiyazh"),
                    ("Эпиляция", "epilyatsiya"),
                    ("Визаж и макияж", "vizazh-makiyazh"),
                    ("SPA-процедуры", "spa-protsedury"),
                    ("Стоматология", "stomatologiya"),
                    ("Фитнес и тренировки", "fitnes-trenirovki"),
                ]
            },
            {
                "id": 250,
                "name": "Образование и курсы",
                "slug": "obrazovanie-kursy",
                "icon": "school",
                "subcategories": [
                    ("Репетиторы", "repetitory"),
                    ("Курсы иностранных языков", "kursy-inostrannykh-yazykov"),
                    ("Компьютерные курсы", "kompyuternye-kursy"),
                    ("Бизнес-тренинги", "biznes-treningi"),
                    ("Курсы красоты", "kursy-krasoty"),
                    ("Музыкальные школы", "muzykalnye-shkoly"),
                    ("Танцы и хореография", "tantsy-khoreografiya"),
                    ("Художественные курсы", "khudozhestvennye-kursy"),
                    ("Курсы вождения", "kursy-vozhdeniya"),
                    ("Профессиональные курсы", "professionalnye-kursy"),
                ]
            },
            {
                "id": 260,
                "name": "Финансовые услуги",
                "slug": "finansovye-uslugi",
                "icon": "account_balance",
                "subcategories": [
                    ("Бухгалтерские услуги", "bukhgalterskie-uslugi"),
                    ("Аудиторские услуги", "auditorskie-uslugi"),
                    ("Юридические услуги", "yuridicheskie-uslugi"),
                    ("Кредиты и займы", "kredity-zaymy"),
                    ("Страхование", "strakhovanie"),
                    ("Инвестиционный консалтинг", "investitsionnyy-konsalting"),
                    ("Налоговое консультирование", "nalogovoe-konsultirovanie"),
                    ("Регистрация бизнеса", "registratsiya-biznesa"),
                    ("Финансовый анализ", "finansovyy-analiz"),
                    ("Коллекторские услуги", "kollektorskie-uslugi"),
                ]
            },
            {
                "id": 270,
                "name": "Авто услуги",
                "slug": "avto-uslugi",
                "icon": "car_repair",
                "subcategories": [
                    ("Ремонт автомобилей", "remont-avtomobiley"),
                    ("Кузовной ремонт", "kuzovnoy-remont"),
                    ("Покраска автомобилей", "pokraska-avtomobiley"),
                    ("Автомойка", "avtomoyka"),
                    ("Шиномонтаж", "shinomontazh"),
                    ("Тонировка стекол", "tonirovka-stekol"),
                    ("Установка сигнализаций", "ustanovka-signalizatsiy"),
                    ("Диагностика автомобилей", "diagnostika-avtomobiley"),
                    ("Эвакуация автомобилей", "evakuatsiya-avtomobiley"),
                    ("Прокат автомобилей", "prokat-avtomobiley"),
                ]
            },
            {
                "id": 280,
                "name": "Организация мероприятий",
                "slug": "organizatsiya-meropriyatiy",
                "icon": "celebration",
                "subcategories": [
                    ("Свадьбы", "svadby"),
                    ("Дни рождения", "dni-rozhdeniya"),
                    ("Корпоративные мероприятия", "korporativnye-meropriyatiya"),
                    ("Юбилеи", "yubilei"),
                    ("Детские праздники", "detskie-prazdniki"),
                    ("Фото и видеосъемка", "foto-videosemka"),
                    ("Ведущие и тамада", "vedushchie-tamada"),
                    ("Музыканты и DJ", "muzykanty-dj"),
                    ("Аренда залов", "arenda-zalov"),
                    ("Кейтеринг", "keytering"),
                ]
            },
            {
                "id": 290,
                "name": "Фото и видео услуги",
                "slug": "foto-video-uslugi",
                "icon": "photo_camera",
                "subcategories": [
                    ("Свадебная фотосъемка", "svadebnaya-fotosemka"),
                    ("Портретная фотосъемка", "portretnaya-fotosemka"),
                    ("Предметная фотосъемка", "predmetnaya-fotosemka"),
                    ("Видеосъемка мероприятий", "videosemka-meropriyatiy"),
                    ("Аэросъемка", "aerosemka"),
                    ("Видеомонтаж", "videomontazh"),
                    ("Обработка фотографий", "obrabotka-fotografiy"),
                    ("Студийная съемка", "studiynaya-semka"),
                    ("Семейная фотосъемка", "semeynaya-fotosemka"),
                    ("Рекламная съемка", "reklamnaya-semka"),
                ]
            },
            {
                "id": 300,
                "name": "Туризм и путешествия",
                "slug": "turizm-puteshestviya",
                "icon": "flight",
                "subcategories": [
                    ("Туристические туры", "turisticheskie-tury"),
                    ("Авиабилеты", "aviabilety"),
                    ("Гостиницы и отели", "gostinitsy-oteli"),
                    ("Визовая поддержка", "vizovaya-podderzhka"),
                    ("Экскурсии", "ekskursii"),
                    ("Трансфер", "transfer"),
                    ("Туристическое страхование", "turisticheskoe-strakhovanie"),
                    ("Круизы", "kruizy"),
                    ("Аренда жилья за рубежом", "arenda-zhilya-za-rubezhom"),
                    ("Горящие туры", "goryashchie-tury"),
                ]
            },
            {
                "id": 310,
                "name": "Услуги для животных",
                "slug": "uslugi-dlya-zhivotnykh",
                "icon": "pets",
                "subcategories": [
                    ("Ветеринарные услуги", "veterinarnye-uslugi"),
                    ("Груминг", "gruming"),
                    ("Передержка животных", "perederzyka-zhivotnykh"),
                    ("Дрессировка", "dressirovka"),
                    ("Выгул собак", "vygul-sobak"),
                    ("Вязка животных", "vyazka-zhivotnykh"),
                    ("Зоотакси", "zootaksi"),
                    ("Зоогостиницы", "zoogostinitsy"),
                    ("Стерилизация и кастрация", "sterilizatsiya-kastratsiya"),
                    ("Ветеринарная аптека", "veterinarnaya-apteka"),
                ]
            },
            {
                "id": 320,
                "name": "Реклама и маркетинг",
                "slug": "reklama-marketing",
                "icon": "campaign",
                "subcategories": [
                    ("Интернет-реклама", "internet-reklama"),
                    ("Наружная реклама", "naruzhnaya-reklama"),
                    ("Полиграфия", "poligrafiya"),
                    ("SMM-продвижение", "smm-prodvizhenie"),
                    ("Создание логотипов", "sozdanie-logotipov"),
                    ("Брендинг", "brending"),
                    ("Копирайтинг", "kopiraiting"),
                    ("PR-услуги", "pr-uslugi"),
                    ("Медиапланирование", "mediaplanirovanie"),
                    ("Email-маркетинг", "email-marketing"),
                ]
            },
        ]
    }
}


def get_subcategory_id_range(parent_id):
    """Определяет диапазон ID для подкатегорий"""
    # Для категорий 10-90: используем формат X001-X010
    if 10 <= parent_id <= 90:
        return parent_id * 100 + 1
    # Для категорий 100, 120, 130: используем 5-значные ID
    elif parent_id == 100:
        return 10001
    elif parent_id == 120:
        return 12001
    elif parent_id == 130:
        return 13001
    # Для услуг (210-320): используем формат XX01-XX10
    elif 210 <= parent_id <= 320:
        return parent_id * 10 + 1
    else:
        raise ValueError(f"Unknown parent_id: {parent_id}")


def generate_sql():
    """Генерирует SQL файл"""
    sql = []

    # Заголовок
    sql.append("-- " + "=" * 60)
    sql.append("-- Миграция категорий: удаление старых и применение новых")
    sql.append("-- Bazarlar Online - Полная структура категорий для Кыргызстана")
    sql.append("-- Сгенерировано автоматически через Python")
    sql.append("-- " + "=" * 60)
    sql.append("")
    sql.append("-- Устанавливаем кодировку UTF8 для корректной работы с кириллицей")
    sql.append("SET client_encoding = 'UTF8';")
    sql.append("")
    sql.append("BEGIN;")
    sql.append("")

    # Шаги очистки
    sql.append("-- ШАГ 1: Отвязываем все продукты от категорий")
    sql.append("UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;")
    sql.append("")
    sql.append("-- ШАГ 2: Отвязываем профили продавцов от категорий")
    sql.append("UPDATE seller_profiles SET category_id = NULL WHERE category_id IS NOT NULL;")
    sql.append("")
    sql.append("-- ШАГ 3: Удаляем все старые категории")
    sql.append("TRUNCATE TABLE categories RESTART IDENTITY CASCADE;")
    sql.append("")

    # Основные категории
    sql.append("-- " + "=" * 60)
    sql.append("-- УРОВЕНЬ 1: ОСНОВНЫЕ КАТЕГОРИИ")
    sql.append("-- " + "=" * 60)
    sql.append("")

    for main_type in ["products", "services"]:
        main_cat = CATEGORIES[main_type]
        sql.append(f"-- {main_cat['id']}. {main_cat['name'].upper()}")
        sql.append("INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)")
        sql.append(f"VALUES ({main_cat['id']}, '{main_cat['name']}', '{main_cat['slug']}', 1, '{main_cat['icon']}', "
                   f"{0 if main_type == 'products' else 1}, true, NULL);")
        sql.append("")

    # Категории и подкатегории
    for main_type, type_name in [("products", "ТОВАРЫ"), ("services", "УСЛУГИ")]:
        main_cat = CATEGORIES[main_type]

        sql.append("-- " + "=" * 60)
        sql.append(f"-- УРОВЕНЬ 2 и 3: {type_name}")
        sql.append("-- " + "=" * 60)
        sql.append("")

        for idx, cat in enumerate(main_cat["children"]):
            # Level 2 category
            sql.append(f"-- {cat['name'].upper()} (id: {cat['id']})")
            sql.append("INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)")
            sql.append(f"VALUES ({cat['id']}, '{cat['name']}', '{cat['slug']}', 2, '{cat['icon']}', "
                       f"{idx}, true, {main_cat['id']});")
            sql.append("")

            # Level 3 subcategories
            if "subcategories" in cat:
                sql.append(f"-- Подкатегории {cat['name']}")
                sql.append("INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES")

                start_id = get_subcategory_id_range(cat['id'])
                subcats = []
                for sub_idx, (sub_name, sub_slug) in enumerate(cat["subcategories"]):
                    sub_id = start_id + sub_idx
                    subcats.append(f"({sub_id}, '{sub_name}', '{sub_slug}', 3, NULL, {sub_idx}, true, {cat['id']})")

                sql.append(",\n".join(subcats) + ";")
                sql.append("")

    # Обновление sequence и статистика
    sql.append("-- " + "=" * 60)
    sql.append("-- Обновляем sequence и показываем статистику")
    sql.append("-- " + "=" * 60)
    sql.append("")
    sql.append("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories) + 1);")
    sql.append("")
    sql.append("SELECT")
    sql.append("    level,")
    sql.append("    COUNT(*) as count")
    sql.append("FROM categories")
    sql.append("GROUP BY level")
    sql.append("ORDER BY level;")
    sql.append("")
    sql.append("COMMIT;")
    sql.append("")
    sql.append("-- Миграция завершена успешно!")

    return "\n".join(sql)


if __name__ == "__main__":
    sql_content = generate_sql()

    with open("migrate_categories.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)

    print("✅ Файл migrate_categories.sql успешно создан!")
    print("📊 Структура:")
    print("   - Уровень 1: 2 категории (Товары, Услуги)")
    print("   - Уровень 2: 24 категории (12 товаров + 12 услуг)")
    print("   - Уровень 3: 240 подкатегорий")
    print("   - ИТОГО: 266 категорий")
