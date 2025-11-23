-- Скрипт для назначения роли администратора пользователю
-- Email: bekisapiev@gmail.com
-- ID: 1cfc8552-4feb-4cc3-8f55-53a0def62fb5

-- Проверяем текущего пользователя
SELECT
    id,
    email,
    full_name,
    role,
    created_at
FROM users
WHERE id = '1cfc8552-4feb-4cc3-8f55-53a0def62fb5'
   OR email = 'bekisapiev@gmail.com';

-- Обновляем роль на admin
UPDATE users
SET role = 'admin',
    updated_at = NOW()
WHERE id = '1cfc8552-4feb-4cc3-8f55-53a0def62fb5';

-- Проверяем результат
SELECT
    id,
    email,
    full_name,
    role,
    updated_at
FROM users
WHERE id = '1cfc8552-4feb-4cc3-8f55-53a0def62fb5';
