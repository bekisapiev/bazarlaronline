# 🚀 Быстрый старт Bazarlar Online

## Запуск с Docker (Рекомендуется)

### 1. Клонирование и настройка

```bash
git clone https://github.com/bekisapiev/bazarlaronline.git
cd bazarlaronline
```

### 2. Создание .env файла

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите минимальные значения:

```env
# Database
DATABASE_URL=postgresql://bazarlar_user:bazarlar_pass@postgres:5432/bazarlar_claude

# JWT Secret (сгенерируйте случайную строку)
SECRET_KEY=your-super-secret-key-change-this

# Google OAuth (необязательно для dev)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Запуск

```bash
docker-compose up -d
```

### 4. Проверка

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### 5. Остановка

```bash
docker-compose down
```

## Локальная разработка (без Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или venv\Scripts\activate для Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Структура проекта

```
bazarlaronline/
├── backend/          # FastAPI Backend
├── frontend/         # React Frontend
├── docker-compose.yml
├── .env.example
├── README.md         # Полное ТЗ
└── QUICKSTART.md     # Это файл
```

## Следующие шаги

1. Настройте Google OAuth для аутентификации
2. Добавьте тестовые данные в базу
3. Настройте Мбанк эквайринг
4. Реализуйте дополнительные функции из ТЗ

## Поддержка

Для полной документации см. [README.md](README.md)
