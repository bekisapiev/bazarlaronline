#!/usr/bin/env python3
"""
Миграция для реферальной системы
Добавляет поля и таблицы для партнерской программы
"""
import asyncio
import sys
from sqlalchemy import text
from app.database.session import async_engine


async def apply_migration():
    """Apply referral system migration"""
    async with async_engine.begin() as conn:
        print("🔄 Применение миграции реферальной системы...")

        try:
            # 1. Добавить поле referral_expires_at в users
            print("  ➤ Добавление поля referral_expires_at в users...")
            await conn.execute(text("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS referral_expires_at TIMESTAMP
            """))

            # 2. Добавить поля в withdrawal_requests
            print("  ➤ Обновление withdrawal_requests...")
            await conn.execute(text("""
                ALTER TABLE withdrawal_requests
                ADD COLUMN IF NOT EXISTS mbank_phone VARCHAR(20),
                ADD COLUMN IF NOT EXISTS balance_type VARCHAR(20) DEFAULT 'referral'
            """))

            await conn.execute(text("""
                ALTER TABLE withdrawal_requests
                ALTER COLUMN account_number DROP NOT NULL,
                ALTER COLUMN account_name DROP NOT NULL
            """))

            # 3. Создать таблицу referral_earnings
            print("  ➤ Создание таблицы referral_earnings...")
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS referral_earnings (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    referrer_id UUID NOT NULL REFERENCES users(id),
                    referee_id UUID NOT NULL REFERENCES users(id),
                    transaction_id UUID REFERENCES transactions(id),
                    topup_amount NUMERIC(10, 2) NOT NULL,
                    earning_amount NUMERIC(10, 2) NOT NULL,
                    status VARCHAR(20) DEFAULT 'completed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            # 4. Создать индексы
            print("  ➤ Создание индексов...")
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer
                ON referral_earnings(referrer_id)
            """))

            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_referral_earnings_created
                ON referral_earnings(created_at)
            """))

            print("✅ Миграция успешно применена!")

        except Exception as e:
            print(f"❌ Ошибка при применении миграции: {e}")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(apply_migration())
