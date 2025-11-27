#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт миграции категорий через прямое подключение к PostgreSQL
Запускать: python migrate_categories_direct.py
"""

import asyncio
import asyncpg
from typing import List, Tuple

# Данные для подключения к базе
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "bazarlar_claude",
    "user": "postgres",
    "password": "postgres"  # ИЗМЕНИТЕ НА ВАШ ПАРОЛЬ!
}

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
                    ("Обучение и тренинги", "obuchenie-treningi"),
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


def get_subcategory_id_range(parent_id: int) -> int:
    """Определяет начальный ID для подкатегорий"""
    if 10 <= parent_id <= 90:
        return parent_id * 100 + 1
    elif parent_id == 100:
        return 10001
    elif parent_id == 120:
        return 12001
    elif parent_id == 130:
        return 13001
    elif 210 <= parent_id <= 320:
        return parent_id * 10 + 1
    else:
        raise ValueError(f"Unknown parent_id: {parent_id}")


async def migrate_categories():
    """Выполняет миграцию категорий"""
    print("=" * 60)
    print("МИГРАЦИЯ КАТЕГОРИЙ")
    print("=" * 60)
    print()

    # Подключаемся к базе
    print("🔌 Подключение к базе данных...")
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        print("✅ Подключение установлено")
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        print("\n⚠️  ПРОВЕРЬТЕ:")
        print("   1. PostgreSQL запущен")
        print("   2. База данных 'bazarlar_claude' существует")
        print("   3. Пароль в DB_CONFIG правильный")
        return

    try:
        # Начинаем транзакцию
        async with conn.transaction():
            print("\n📦 Начало транзакции...")

            # Шаг 1: Отвязываем продукты
            print("\n1️⃣  Отвязываем продукты от категорий...")
            result = await conn.execute(
                "UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL"
            )
            print(f"   ✅ Обновлено продуктов: {result.split()[-1]}")

            # Шаг 2: Отвязываем профили продавцов
            print("\n2️⃣  Отвязываем профили продавцов от категорий...")
            result = await conn.execute(
                "UPDATE seller_profiles SET category_id = NULL WHERE category_id IS NOT NULL"
            )
            print(f"   ✅ Обновлено профилей: {result.split()[-1]}")

            # Шаг 3: Очищаем таблицу категорий
            print("\n3️⃣  Очищаем таблицу категорий...")
            await conn.execute("TRUNCATE TABLE categories RESTART IDENTITY CASCADE")
            print("   ✅ Таблица очищена")

            # Шаг 4: Вставляем основные категории
            print("\n4️⃣  Вставляем основные категории...")
            for main_type in ["products", "services"]:
                main_cat = CATEGORIES[main_type]
                await conn.execute(
                    """
                    INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """,
                    main_cat["id"],
                    main_cat["name"],
                    main_cat["slug"],
                    1,
                    main_cat["icon"],
                    0 if main_type == "products" else 1,
                    True,
                    None
                )
                print(f"   ✅ {main_cat['name']}")

            # Шаг 5: Вставляем категории уровня 2 и 3
            print("\n5️⃣  Вставляем категории товаров и услуг...")

            total_level2 = 0
            total_level3 = 0

            for main_type, type_name in [("products", "Товары"), ("services", "Услуги")]:
                main_cat = CATEGORIES[main_type]
                print(f"\n   📂 {type_name}:")

                for idx, cat in enumerate(main_cat["children"]):
                    # Уровень 2
                    await conn.execute(
                        """
                        INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        """,
                        cat["id"],
                        cat["name"],
                        cat["slug"],
                        2,
                        cat["icon"],
                        idx,
                        True,
                        main_cat["id"]
                    )
                    total_level2 += 1

                    # Уровень 3
                    if "subcategories" in cat:
                        start_id = get_subcategory_id_range(cat["id"])
                        for sub_idx, (sub_name, sub_slug) in enumerate(cat["subcategories"]):
                            sub_id = start_id + sub_idx
                            await conn.execute(
                                """
                                INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                """,
                                sub_id,
                                sub_name,
                                sub_slug,
                                3,
                                None,
                                sub_idx,
                                True,
                                cat["id"]
                            )
                            total_level3 += 1

                    print(f"      ✅ {cat['name']} (+{len(cat.get('subcategories', []))} подкатегорий)")

            # Шаг 6: Обновляем sequence
            print("\n6️⃣  Обновляем sequence...")
            max_id = await conn.fetchval("SELECT MAX(id) FROM categories")
            await conn.execute(f"SELECT setval('categories_id_seq', {max_id + 1})")
            print(f"   ✅ Sequence установлен на {max_id + 1}")

            # Статистика
            print("\n7️⃣  Проверяем результат...")
            stats = await conn.fetch(
                """
                SELECT level, COUNT(*) as count
                FROM categories
                GROUP BY level
                ORDER BY level
                """
            )

            print("\n" + "=" * 60)
            print("📊 СТАТИСТИКА:")
            print("=" * 60)
            for row in stats:
                level_name = {1: "Основные", 2: "Категории", 3: "Подкатегории"}
                print(f"   Уровень {row['level']} ({level_name[row['level']]}): {row['count']}")

            total = sum(row['count'] for row in stats)
            print(f"\n   ВСЕГО: {total} категорий")

            print("\n" + "=" * 60)
            print("✅ МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
            print("=" * 60)

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        print("\n⚠️  Транзакция откачена, база данных не изменена")
        raise
    finally:
        await conn.close()
        print("\n🔌 Соединение закрыто")


async def main():
    """Главная функция"""
    try:
        await migrate_categories()
    except KeyboardInterrupt:
        print("\n\n⚠️  Прервано пользователем")
    except Exception as e:
        print(f"\n\n❌ Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("\n🚀 Запуск миграции категорий...")
    print("\n⚠️  ВНИМАНИЕ: Скрипт удалит все существующие категории!")
    print("   Продукты и профили продавцов НЕ будут удалены,")
    print("   но будут отвязаны от категорий.\n")

    response = input("Продолжить? (да/нет): ").lower().strip()
    if response in ["да", "yes", "y", "д"]:
        asyncio.run(main())
    else:
        print("\n❌ Миграция отменена")
