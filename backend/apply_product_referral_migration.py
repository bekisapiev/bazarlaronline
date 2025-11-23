#!/usr/bin/env python3
"""
Миграция для реферальной программы товаров
Добавляет поля и таблицы для партнерской программы на уровне товаров
"""
import asyncio
import sys
from sqlalchemy import text
from app.database.session import engine


async def apply_migration():
    """Apply product referral system migration"""
    async with engine.begin() as conn:
        print("🔄 Применение миграции реферальной программы товаров...")

        try:
            # 1. Добавить поля реферальной программы в products
            print("  ➤ Добавление полей is_referral_enabled и referral_commission_percent в products...")
            await conn.execute(text("""
                ALTER TABLE products
                ADD COLUMN IF NOT EXISTS is_referral_enabled BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS referral_commission_percent NUMERIC(5, 2)
            """))

            # 2. Добавить CHECK constraint для процента комиссии (1-50%)
            print("  ➤ Добавление CHECK constraint для процента комиссии...")
            await conn.execute(text("""
                ALTER TABLE products
                DROP CONSTRAINT IF EXISTS check_referral_commission
            """))

            await conn.execute(text("""
                ALTER TABLE products
                ADD CONSTRAINT check_referral_commission
                CHECK (referral_commission_percent IS NULL OR (referral_commission_percent >= 1 AND referral_commission_percent <= 50))
            """))

            # 3. Создать таблицу product_referral_purchases
            print("  ➤ Создание таблицы product_referral_purchases...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS product_referral_purchases (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    referrer_id UUID NOT NULL REFERENCES users(id),
                    buyer_id UUID NOT NULL REFERENCES users(id),
                    product_id UUID NOT NULL REFERENCES products(id),
                    order_id UUID REFERENCES orders(id),
                    commission_percent NUMERIC(5, 2) NOT NULL,
                    commission_amount NUMERIC(10, 2) NOT NULL,
                    product_price NUMERIC(10, 2) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            # 4. Создать индексы для product_referral_purchases
            print("  ➤ Создание индексов для product_referral_purchases...")
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_product_referral_purchases_referrer
                ON product_referral_purchases(referrer_id)
            """))

            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_product_referral_purchases_buyer
                ON product_referral_purchases(buyer_id)
            """))

            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_product_referral_purchases_product
                ON product_referral_purchases(product_id)
            """))

            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_product_referral_purchases_order
                ON product_referral_purchases(order_id)
            """))

            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_product_referral_purchases_created
                ON product_referral_purchases(created_at)
            """))

            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_product_referral_purchases_status
                ON product_referral_purchases(status)
            """))

            # 5. Создать индекс для поиска товаров с реферальной программой
            print("  ➤ Создание индекса для is_referral_enabled...")
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_products_referral_enabled
                ON products(is_referral_enabled)
                WHERE is_referral_enabled = TRUE
            """))

            print("✅ Миграция успешно применена!")

        except Exception as e:
            print(f"❌ Ошибка при применении миграции: {e}")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(apply_migration())
