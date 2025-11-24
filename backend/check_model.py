#!/usr/bin/env python3
"""
Диагностический скрипт для проверки модели Product
Проверяет наличие всех необходимых атрибутов и свойств
"""

import sys
import os

# Добавить путь к приложению
sys.path.insert(0, os.path.dirname(__file__))

try:
    from app.models.product import Product
    from sqlalchemy import inspect

    print("=== Проверка модели Product ===\n")

    # Получить mapper для модели
    mapper = inspect(Product)

    print("Колонки модели:")
    for column in mapper.columns:
        print(f"  - {column.name}: {column.type} (nullable={column.nullable}, default={column.default})")

    print("\nСвойства (properties):")
    for prop in mapper.all_orm_descriptors:
        if hasattr(prop, 'fget'):  # Это property
            print(f"  - {prop.key} (property)")

    print("\n=== Проверка специфичных атрибутов продвижения ===")
    expected_columns = [
        'promotion_views_total',
        'promotion_views_remaining',
        'promotion_started_at'
    ]

    missing_columns = []
    for col_name in expected_columns:
        if col_name in [c.name for c in mapper.columns]:
            print(f"✓ {col_name} найдена")
        else:
            print(f"✗ {col_name} НЕ НАЙДЕНА!")
            missing_columns.append(col_name)

    # Проверить, что старые колонки удалены
    print("\n=== Проверка удаления старых колонок ===")
    old_columns = ['is_promoted', 'promoted_at']
    for col_name in old_columns:
        if col_name in [c.name for c in mapper.columns]:
            print(f"✗ {col_name} все еще существует (должна быть удалена!)")
        else:
            print(f"✓ {col_name} удалена")

    # Проверить свойство is_promoted
    print("\n=== Проверка свойства is_promoted ===")
    if hasattr(Product, 'is_promoted'):
        is_prop = isinstance(getattr(Product.__class__, 'is_promoted', None), property)
        if is_prop:
            print("✓ is_promoted существует как @property")
        else:
            print("✗ is_promoted существует, но НЕ как property!")
    else:
        print("✗ is_promoted НЕ найдено!")

    print("\n=== Результат ===")
    if missing_columns:
        print(f"ОШИБКА: Отсутствуют колонки: {', '.join(missing_columns)}")
        print("Необходимо выполнить миграцию базы данных!")
        sys.exit(1)
    else:
        print("✓ Все необходимые колонки присутствуют в модели")
        print("✓ Модель Product настроена правильно")
        sys.exit(0)

except Exception as e:
    print(f"ОШИБКА при проверке модели: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
