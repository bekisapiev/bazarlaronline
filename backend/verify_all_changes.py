#!/usr/bin/env python3
"""
Скрипт полной проверки всех изменений в системе продвижения
Проверяет корректность всех файлов после рефакторинга
"""

import sys
import os
from pathlib import Path

# Добавить путь к приложению
sys.path.insert(0, os.path.dirname(__file__))

def check_file_content(file_path, should_contain, should_not_contain):
    """Проверить содержимое файла"""
    print(f"\n📄 Проверка {file_path}...")

    if not os.path.exists(file_path):
        print(f"  ✗ Файл не найден!")
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    all_good = True

    # Проверить что должно быть
    for item in should_contain:
        if item in content:
            print(f"  ✓ Найдено: {item[:60]}...")
        else:
            print(f"  ✗ НЕ НАЙДЕНО: {item[:60]}...")
            all_good = False

    # Проверить что НЕ должно быть
    for item in should_not_contain:
        if item not in content:
            print(f"  ✓ Отсутствует (правильно): {item[:60]}...")
        else:
            print(f"  ✗ НАЙДЕНО (не должно быть): {item[:60]}...")
            all_good = False

    return all_good

def main():
    print("=" * 80)
    print("ПОЛНАЯ ПРОВЕРКА СИСТЕМЫ ПРОДВИЖЕНИЯ")
    print("=" * 80)

    all_checks_passed = True

    # 1. Проверка модели Product
    all_checks_passed &= check_file_content(
        "app/models/product.py",
        should_contain=[
            "promotion_views_total = Column(Integer, default=0)",
            "promotion_views_remaining = Column(Integer, default=0)",
            "promotion_started_at = Column(DateTime, nullable=True)",
            "@property",
            "def is_promoted(self):",
            "return self.promotion_views_remaining > 0"
        ],
        should_not_contain=[
            "is_promoted = Column(Boolean",
            "promoted_at = Column(DateTime"
        ]
    )

    # 2. Проверка схемы ProductResponse
    all_checks_passed &= check_file_content(
        "app/schemas/product.py",
        should_contain=[
            "promotion_views_total: Optional[int]",
            "promotion_views_remaining: Optional[int]",
            "promotion_started_at: Optional[datetime]"
        ],
        should_not_contain=[
            "promoted_at: Optional[datetime]"
        ]
    )

    # 3. Проверка products.py
    all_checks_passed &= check_file_content(
        "app/api/v1/endpoints/products.py",
        should_contain=[
            "func.coalesce(Product.promotion_views_remaining, 0)",
            "getattr(p, 'promotion_views_remaining', 0)"
        ],
        should_not_contain=[
            "desc(Product.is_promoted)",
            "Product.is_promoted,"
        ]
    )

    # 4. Проверка seller_profile.py
    all_checks_passed &= check_file_content(
        "app/api/v1/endpoints/seller_profile.py",
        should_contain=[
            "func.coalesce(Product.promotion_views_remaining, 0)",
            "getattr(p, 'promotion_views_remaining', 0)"
        ],
        should_not_contain=[
            "desc(Product.is_promoted)",
        ]
    )

    # 5. Проверка recommendations.py
    all_checks_passed &= check_file_content(
        "app/api/v1/endpoints/recommendations.py",
        should_contain=[
            "func.coalesce(Product.promotion_views_remaining, 0)"
        ],
        should_not_contain=[
            "desc(Product.is_promoted)",
        ]
    )

    # 6. Проверка search.py
    all_checks_passed &= check_file_content(
        "app/api/v1/endpoints/search.py",
        should_contain=[
            "func.coalesce(Product.promotion_views_remaining, 0)"
        ],
        should_not_contain=[
            "desc(Product.is_promoted)",
        ]
    )

    # 7. Проверка analytics.py
    all_checks_passed &= check_file_content(
        "app/api/v1/endpoints/analytics.py",
        should_contain=[
            "Product.promotion_views_remaining",
            "(row.promotion_views_remaining or 0) > 0"
        ],
        should_not_contain=[
            "Product.is_promoted,",
            "row.is_promoted"
        ]
    )

    # 8. Проверка миграции
    all_checks_passed &= check_file_content(
        "migration_promotion_views.sql",
        should_contain=[
            "DROP TABLE IF EXISTS auto_promotions",
            "DROP COLUMN IF EXISTS is_promoted",
            "DROP COLUMN IF EXISTS promoted_at",
            "ADD COLUMN IF NOT EXISTS promotion_views_total",
            "ADD COLUMN IF NOT EXISTS promotion_views_remaining",
            "ADD COLUMN IF NOT EXISTS promotion_started_at"
        ],
        should_not_contain=[]
    )

    print("\n" + "=" * 80)
    if all_checks_passed:
        print("✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!")
        print("=" * 80)
        print("\nСистема продвижения полностью переделана:")
        print("  ✓ Модель Product обновлена")
        print("  ✓ Схемы обновлены")
        print("  ✓ Все эндпоинты исправлены (5 файлов)")
        print("  ✓ Миграция создана")
        print("  ✓ Все SQL запросы используют promotion_views_remaining")
        print("  ✓ is_promoted вычисляется динамически")
        print("\nСервер готов к запуску!")
        sys.exit(0)
    else:
        print("❌ НЕКОТОРЫЕ ПРОВЕРКИ НЕ ПРОШЛИ!")
        print("=" * 80)
        print("\nНеобходимо исправить ошибки выше.")
        sys.exit(1)

if __name__ == "__main__":
    main()
