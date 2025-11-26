"""
Генерация SQL для заполнения категорий
Используйте этот скрипт если нужно вручную запустить SQL в базе данных
"""


# Структура категорий (такая же как в seed_categories.py)
CATEGORIES = {
    "Товары": {
        "level": 1,
        "slug": "tovary",
        "icon": "shopping_bag",
        "children": {
            "Электроника": {
                "slug": "elektronika",
                "icon": "devices",
                "children": [
                    "Телефоны и аксессуары",
                    "Ноутбуки и компьютеры",
                    "Планшеты и электронные книги",
                    "ТВ, аудио, видео",
                    "Фото и видеокамеры",
                    "Игровые приставки и игры",
                    "Умные устройства и гаджеты",
                    "Комплектующие для ПК",
                    "Офисная техника",
                ]
            },
            "Одежда и обувь": {
                "slug": "odezhda-i-obuv",
                "icon": "checkroom",
                "children": [
                    "Женская одежда",
                    "Мужская одежда",
                    "Детская одежда",
                    "Женская обувь",
                    "Мужская обувь",
                    "Детская обувь",
                    "Аксессуары и украшения",
                    "Сумки и рюкзаки",
                    "Свадебные платья",
                ]
            },
            "Дом и сад": {
                "slug": "dom-i-sad",
                "icon": "home",
                "children": [
                    "Мебель",
                    "Посуда и кухонная утварь",
                    "Бытовая техника",
                    "Ремонт и строительство",
                    "Текстиль и ковры",
                    "Освещение и электрика",
                    "Сантехника",
                    "Инструменты",
                    "Растения и семена",
                    "Садовая техника и инвентарь",
                ]
            },
            "Детские товары": {
                "slug": "detskie-tovary",
                "icon": "child_care",
                "children": [
                    "Коляски и автокресла",
                    "Игрушки",
                    "Детская мебель",
                    "Товары для новорожденных",
                    "Детское питание",
                    "Школьные принадлежности",
                ]
            },
            "Красота и здоровье": {
                "slug": "krasota-i-zdorovye",
                "icon": "spa",
                "children": [
                    "Парфюмерия",
                    "Косметика и уход",
                    "Средства гигиены",
                    "Медицинские товары",
                    "БАДы и витамины",
                    "Массажёры и тренажёры",
                ]
            },
            "Спорт и отдых": {
                "slug": "sport-i-otdyh",
                "icon": "sports_soccer",
                "children": [
                    "Спортивная одежда и обувь",
                    "Тренажёры",
                    "Велосипеды",
                    "Туризм и кемпинг",
                    "Зимние виды спорта",
                    "Рыбалка и охота",
                    "Настольные игры и хобби",
                ]
            },
            "Авто и мото": {
                "slug": "avto-i-moto",
                "icon": "directions_car",
                "children": [
                    "Легковые автомобили",
                    "Грузовые автомобили",
                    "Автобусы и микроавтобусы",
                    "Мотоциклы и мототехника",
                    "Водный транспорт",
                    "Запчасти и аксессуары",
                    "Шины и диски",
                    "Автоэлектроника",
                    "Автомобильная химия",
                ]
            },
            "Недвижимость": {
                "slug": "nedvizhimost",
                "icon": "apartment",
                "children": [
                    "Квартиры",
                    "Комнаты",
                    "Дома и дачи",
                    "Земельные участки",
                    "Коммерческая недвижимость",
                    "Гаражи и парковки",
                    "Посуточная аренда",
                ]
            },
            "Продукты питания": {
                "slug": "produkty-pitaniya",
                "icon": "restaurant",
                "children": [
                    "Мясо и птица",
                    "Молочные продукты",
                    "Хлеб и выпечка",
                    "Фрукты и овощи",
                    "Бакалея",
                    "Напитки",
                    "Кондитерские изделия",
                    "Замороженные продукты",
                    "Готовая еда",
                ]
            },
            "Книги и учебная литература": {
                "slug": "knigi",
                "icon": "menu_book",
                "children": [
                    "Художественная литература",
                    "Учебники и пособия",
                    "Детские книги",
                    "Научная литература",
                    "Словари и энциклопедии",
                ]
            },
            "Животные": {
                "slug": "zhivotnye",
                "icon": "pets",
                "children": [
                    "Собаки",
                    "Кошки",
                    "Птицы",
                    "Аквариумные рыбки",
                    "Сельскохозяйственные животные",
                    "Товары для животных",
                ]
            },
            "Бизнес и оборудование": {
                "slug": "biznes-i-oborudovanie",
                "icon": "business_center",
                "children": [
                    "Торговое оборудование",
                    "Промышленное оборудование",
                    "Оборудование для общепита",
                    "Медицинское оборудование",
                    "Сельхозтехника",
                    "Готовый бизнес",
                ]
            },
        }
    },
    "Услуги": {
        "level": 1,
        "slug": "uslugi",
        "icon": "work",
        "children": {
            "Строительство и ремонт": {
                "slug": "stroitelstvo-i-remont",
                "icon": "construction",
                "children": [
                    "Строительство домов",
                    "Ремонт квартир",
                    "Отделочные работы",
                    "Кровельные работы",
                    "Электромонтажные работы",
                    "Сантехнические работы",
                    "Установка окон и дверей",
                    "Ландшафтный дизайн",
                ]
            },
            "Красота и здоровье": {
                "slug": "uslugi-krasoty",
                "icon": "spa",
                "children": [
                    "Парикмахерские услуги",
                    "Маникюр и педикюр",
                    "Косметология",
                    "Массаж",
                    "Стоматология",
                    "Медицинские услуги",
                    "Фитнес и йога",
                ]
            },
            "Транспортные услуги": {
                "slug": "transportnye-uslugi",
                "icon": "local_shipping",
                "children": [
                    "Грузоперевозки",
                    "Пассажирские перевозки",
                    "Услуги такси",
                    "Переезды и грузчики",
                    "Курьерские услуги",
                    "Эвакуатор",
                ]
            },
            "Ремонт техники": {
                "slug": "remont-tehniki",
                "icon": "build",
                "children": [
                    "Ремонт телефонов",
                    "Ремонт компьютеров",
                    "Ремонт бытовой техники",
                    "Ремонт автомобилей",
                    "Ремонт электроники",
                ]
            },
            "Образование и курсы": {
                "slug": "obrazovanie",
                "icon": "school",
                "children": [
                    "Репетиторы",
                    "Языковые курсы",
                    "Компьютерные курсы",
                    "Музыкальные занятия",
                    "Детские кружки",
                    "Профессиональные курсы",
                ]
            },
            "Организация мероприятий": {
                "slug": "meropriyatiya",
                "icon": "celebration",
                "children": [
                    "Тамада и ведущие",
                    "Фото и видеосъёмка",
                    "Музыканты и диджеи",
                    "Аренда залов",
                    "Кейтеринг",
                    "Украшение залов",
                    "Свадебные услуги",
                ]
            },
            "Бытовые услуги": {
                "slug": "bytovye-uslugi",
                "icon": "home_repair_service",
                "children": [
                    "Уборка помещений",
                    "Химчистка",
                    "Ремонт одежды и обуви",
                    "Няни и сиделки",
                    "Ремонт мебели",
                ]
            },
            "IT и интернет": {
                "slug": "it-uslugi",
                "icon": "computer",
                "children": [
                    "Разработка сайтов",
                    "Разработка приложений",
                    "SEO продвижение",
                    "Настройка компьютеров",
                    "Восстановление данных",
                    "IT консультации",
                ]
            },
            "Реклама и маркетинг": {
                "slug": "reklama-i-marketing",
                "icon": "campaign",
                "children": [
                    "Наружная реклама",
                    "Интернет-реклама",
                    "Полиграфия",
                    "Дизайн и брендинг",
                    "SMM продвижение",
                ]
            },
            "Юридические услуги": {
                "slug": "yuridicheskie-uslugi",
                "icon": "gavel",
                "children": [
                    "Юридические консультации",
                    "Регистрация бизнеса",
                    "Составление договоров",
                    "Представительство в суде",
                ]
            },
            "Финансовые услуги": {
                "slug": "finansovye-uslugi",
                "icon": "account_balance",
                "children": [
                    "Бухгалтерские услуги",
                    "Аудит",
                    "Кредитование",
                    "Страхование",
                ]
            },
            "Туризм и отдых": {
                "slug": "turizm",
                "icon": "flight",
                "children": [
                    "Туристические путёвки",
                    "Визовая поддержка",
                    "Бронирование отелей",
                    "Экскурсии",
                    "Аренда жилья для отдыха",
                ]
            },
        }
    }
}


def transliterate(text):
    """Простая транслитерация для slug"""
    translit = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '-', ',': '', '.': ''
    }
    result = ''
    for char in text.lower():
        result += translit.get(char, char)
    return result


def generate_sql():
    """Генерация SQL скрипта"""
    sql_lines = []
    sql_lines.append("-- Скрипт заполнения категорий для Bazarlar Online")
    sql_lines.append("-- Категории для Кыргызстана\n")
    sql_lines.append("BEGIN;\n")

    # ID счётчики (начинаем с 1000 чтобы не конфликтовать с существующими)
    current_id = 1000

    # Проходим по основным категориям
    for main_name, main_data in CATEGORIES.items():
        main_id = current_id
        current_id += 1

        # Вставка основной категории (уровень 1)
        sql_lines.append(f"-- Основная категория: {main_name}")
        sql_lines.append(f"INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)")
        sql_lines.append(f"VALUES ({main_id}, '{main_name}', '{main_data['slug']}', 1, '{main_data.get('icon', '')}', 0, true, NULL);")
        sql_lines.append("")

        # Проходим по подкатегориям уровня 2
        level2_sort = 0
        for sub_name, sub_data in main_data["children"].items():
            sub_id = current_id
            current_id += 1

            sql_lines.append(f"-- Подкатегория: {main_name} → {sub_name}")
            sql_lines.append(f"INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)")
            sql_lines.append(f"VALUES ({sub_id}, '{sub_name}', '{sub_data['slug']}', 2, '{sub_data.get('icon', '')}', {level2_sort}, true, {main_id});")
            level2_sort += 1

            # Проходим по подкатегориям уровня 3
            if "children" in sub_data and isinstance(sub_data["children"], list):
                level3_sort = 0
                for subsub_name in sub_data["children"]:
                    subsub_id = current_id
                    current_id += 1

                    # Генерируем slug
                    subsub_slug = f"{sub_data['slug']}-{transliterate(subsub_name)}"

                    sql_lines.append(f"INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)")
                    sql_lines.append(f"VALUES ({subsub_id}, '{subsub_name}', '{subsub_slug}', 3, NULL, {level3_sort}, true, {sub_id});")
                    level3_sort += 1

            sql_lines.append("")

    # Обновляем sequence
    sql_lines.append(f"-- Обновляем sequence для id")
    sql_lines.append(f"SELECT setval('categories_id_seq', {current_id}, false);")
    sql_lines.append("")
    sql_lines.append("COMMIT;")

    return "\n".join(sql_lines)


if __name__ == "__main__":
    print("Генерация SQL скрипта для категорий...")
    sql = generate_sql()

    # Сохраняем в файл
    output_file = "categories_seed.sql"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(sql)

    print(f"✅ SQL скрипт сохранён в файл: {output_file}")
    print(f"Запустите его в PostgreSQL:")
    print(f"  psql -U postgres -d bazarlar_online -f {output_file}")
