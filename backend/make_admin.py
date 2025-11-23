#!/usr/bin/env python3
"""
Скрипт для назначения роли администратора пользователю
"""
import asyncio
from sqlalchemy import text
from app.database.session import engine


async def make_user_admin(user_id: str, email: str):
    """Назначить роль администратора пользователю"""

    print(f"Изменение роли пользователя на 'admin'...")
    print(f"User ID: {user_id}")
    print(f"Email: {email}")

    async with engine.begin() as conn:
        # Проверяем существование пользователя
        check_query = text("""
            SELECT id, email, full_name, role
            FROM users
            WHERE id = :user_id OR email = :email
        """)

        result = await conn.execute(
            check_query,
            {"user_id": user_id, "email": email}
        )
        user = result.fetchone()

        if not user:
            print(f"❌ Пользователь с ID '{user_id}' или email '{email}' не найден!")
            return

        print(f"\nНайден пользователь:")
        print(f"  ID: {user[0]}")
        print(f"  Email: {user[1]}")
        print(f"  Имя: {user[2] or 'Не указано'}")
        print(f"  Текущая роль: {user[3]}")

        # Обновляем роль
        update_query = text("""
            UPDATE users
            SET role = 'admin'
            WHERE id = :user_id
        """)

        await conn.execute(update_query, {"user_id": str(user[0])})
        print(f"\n✅ Роль успешно изменена на 'admin'!")

        # Проверяем изменения
        verify_result = await conn.execute(
            text("SELECT role FROM users WHERE id = :user_id"),
            {"user_id": str(user[0])}
        )
        new_role = verify_result.fetchone()[0]
        print(f"✅ Проверка: новая роль = '{new_role}'")


if __name__ == "__main__":
    # Данные пользователя
    USER_ID = "1cfc8552-4feb-4cc3-8f55-53a0def62fb5"
    USER_EMAIL = "bekisapiev@gmail.com"

    asyncio.run(make_user_admin(USER_ID, USER_EMAIL))
