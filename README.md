# bazarlaronline
Bazarlar Online - платформа для торговли товарами и услугами и для заработка.

# Техническое задание на разработку веб-платформы Bazarlar Online

## 1. Общая информация о проекте

### 1.1 Описание платформы
**Название**: Bazarlar Online  
**Домен**: bazarlar.online  
**Назначение**: Торговая веб-платформа для размещения товаров и услуг с системой партнерской программы, позволяющая продавцам создавать лендинги своих магазинов и принимать онлайн-платежи.

### 1.2 Технологический стек

#### Frontend
- **Framework**: React.js (последняя стабильная версия 18.3.1)
- **Язык**: TypeScript 5.5+
- **Стилизация**: 
  - CSS Modules / Styled Components
  - Mobile-first подход
  - Адаптивный дизайн
- **State Management**: Redux Toolkit / Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **UI Components**: Custom components с Material-UI базой
- **Real-time**: WebSockets (Socket.io-client) для чата
- **Image Processing**: Sharp.js для обработки изображений

#### Backend
- **Framework**: FastAPI (версия 0.115.0+)
- **Язык**: Python 3.12+
- **ORM**: SQLAlchemy 2.0+
- **Migration**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: OAuth 2.0 (Google)
- **WebSocket**: python-socketio
- **Task Queue**: Celery + Redis
- **Image Processing**: Pillow
- **AI Integration**: Google Cloud Vision API для модерации

#### Database
- **СУБД**: PostgreSQL 16+
- **Название БД**: bazarlar_claude
- **Cache**: Redis для кэширования и сессий
- **File Storage**: Локальное хранилище для dev, S3-совместимое для production

#### DevOps & Deployment
- **Development**: Windows 11, локальный сервер
- **Production**: Beget.com хостинг
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **Process Manager**: Supervisor/PM2
- **SSL**: Let's Encrypt
- **Monitoring**: Prometheus + Grafana

## 2. Дизайн и UI/UX требования

### 2.1 Визуальная концепция
- **Стиль**: Минималистичный, современный, лаконичный
- **Подход**: Mobile-first дизайн
- **Адаптивность**: Полная адаптация под все размеры экранов

### 2.2 Цветовая палитра
```css
:root {
  --color-primary: #FF6B35;     /* Оранжевый - основной акцент */
  --color-secondary: #4CAF50;   /* Зеленый - успех, подтверждение */
  --color-dark: #1A1A1A;        /* Черный - текст, заголовки */
  --color-light: #FFFFFF;        /* Белый - фон */
  --color-gray: #757575;         /* Серый - вторичный текст */
  --color-gray-light: #F5F5F5;  /* Светло-серый - фоны карточек */
  --color-danger: #F44336;       /* Красный - ошибки */
}
```

### 2.3 Типографика
- **Основной шрифт**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Заголовки**: Bold (700), размеры 24-48px
- **Основной текст**: Regular (400), 14-16px
- **Вторичный текст**: Regular (400), 12-14px, цвет gray

### 2.4 Компоненты интерфейса
- **Карточки**: Закругленные углы (8px), тень при hover
- **Кнопки**: Закругленные (4-6px), с анимацией при нажатии
- **Формы**: Минималистичные поля ввода с плавающими подписями
- **Модальные окна**: Затемненный фон, центрированное содержимое
- **Уведомления**: Toast-уведомления в правом верхнем углу

## 3. Структура и функциональность платформы

### 3.1 Главная страница

#### Компоненты
1. **Шапка сайта**
   - Логотип Bazarlar Online
   - Поисковая строка
   - Кнопки: Войти/Профиль, Добавить объявление
   - Переключатель языка (RU/KG)

2. **Фильтры**
   - Переключатель: Товары / Услуги
   - Текстовый поиск с автодополнением
   - Иерархический выбор категории (3 уровня)
   - Выбор города (dropdown с поиском)
   - Тип продавца:
     - Рынок (при выборе появляется список рынков по городам)
     - Бутик
     - Магазин
     - Офис
     - Дома
     - На выезд
     - Склад

3. **Сетка товаров/услуг**
   - Отображение: 30 карточек на странице
   - Бесконечная прокрутка (подгрузка по 30)
   - Skeleton loading при загрузке

#### Карточка товара/услуги
```javascript
interface ProductCard {
  id: string;
  images: string[]; // массив URL, первое - превью
  title: string; // до 100 символов
  price: number;
  discountPrice?: number;
  discountPercent?: number; // автоматический расчет
  seller: {
    id: string;
    logo: string;
    name: string;
    city: string;
    type: SellerType;
    market?: string; // если type === 'market'
    rating: number; // 0-10
  };
  isPromoted?: boolean; // поднятое объявление
}
```

**Отображение карточки**:
- Изображение товара (350x350)
- Название (жирным)
- Цена (если есть скидка - зачеркнутая серым)
- Цена со скидкой (зеленым) + badge со % скидки
- Блок продавца:
  - Лого (30x30)
  - Название (черным, жирным)
  - Город, тип, рынок (серым, мелким шрифтом)
- Кнопка "Заказать" (быстрый заказ)
- Hint: "Для заказа нескольких товаров перейдите к продавцу"

### 3.2 Страница "Продавцы"

#### Фильтры
- Поиск по названию
- Категории (иерархический список)
- Тип продавца
- Выбор рынка (если выбран тип "Рынок")
- Сортировка: по рейтингу, по количеству товаров

#### Карточка продавца
```javascript
interface SellerCard {
  id: string;
  banner: string; // 1200x300
  logo: string; // 100x100
  name: string;
  description: string;
  category: string;
  city: string;
  type: SellerType;
  market?: string;
  tariff: 'Free' | 'Pro' | 'Business';
  rating: number; // 0-10
  reviewsCount: number;
  productsCount: number;
  isVerified: boolean;
}
```

**Примечание**: Отображаются только продавцы с тарифами Pro и Business

### 3.3 Профиль пользователя / Лендинг продавца

#### Структура лендинга
1. **Баннер** (1200x300) с возможностью загрузки
2. **Информационный блок**:
   - Логотип (100x100)
   - Название с badge тарифа
   - Категория, город, тип, рынок
   - Рейтинг и количество отзывов
   - Описание (до 2000 символов)

3. **Вкладки**:
   - Товары и услуги
   - О продавце
   - Отзывы
   - Контакты и карта

4. **Карта** с меткой местоположения

5. **Корзина** (только на странице продавца):
   ```javascript
   interface CartItem {
     productId: string;
     quantity: number;
     price: number;
     discountPrice?: number;
   }
   
   interface Cart {
     sellerId: string;
     items: CartItem[];
     totalAmount: number;
     totalQuantity: number;
     deliveryAddress?: string;
     phoneNumber?: string;
   }
   ```

#### Меню профиля пользователя
1. **Настройки профиля**
   - Название магазина
   - Описание
   - Категория
   - Телефон и ФИО (видно только в админке)
   - Местоположение на карте
   - Город и адрес
   - Баннер и логотип

2. **Мои объявления**
   - Список с фильтрами: Активные/Неактивные/Модерация
   - Действия: Редактировать, Удалить, Поднять, Автоподнятие

3. **Мне заказали** (для продавцов)
   ```javascript
   interface Order {
     id: string;
     orderNumber: string;
     buyerId: string;
     items: OrderItem[];
     totalAmount: number;
     status: 'pending' | 'processing' | 'completed' | 'cancelled';
     paymentMethod: 'wallet' | 'mbank';
     deliveryType: string;
     deliveryAddress?: string;
     phoneNumber: string;
     createdAt: Date;
   }
   ```

4. **Я заказал** (для покупателей)
   - История заказов с фильтрами по статусу

5. **Сообщения** (чат)
   - Список диалогов
   - Непрочитанные сообщения
   - Поиск по диалогам

6. **Партнерская программа**
   - Статистика по дням/месяцам/годам
   - График доходов
   - Список рефералов
   - Партнерская ссылка для приглашений
   - Кнопки шаринга (WhatsApp, Telegram, Instagram, Facebook, Email, SMS)

7. **Кошелек**
   ```javascript
   interface Wallet {
     userId: string;
     mainBalance: number; // основной баланс (не выводится)
     referralBalance: number; // реферальный баланс (можно выводить)
     currency: 'KGS';
   }
   ```
   - Основной баланс (для внутренних платежей)
   - Реферальный баланс (минимальный вывод 3000 сом)
   - Кнопка пополнения
   - Форма вывода средств (номер Мбанка, имя, сумма)

8. **История транзакций**
   - Фильтры: по типу, по дате
   - Пагинация
   - Экспорт в Excel

9. **Обучение**
   - Правила работы партнерской программы
   - Инструкция по добавлению товаров
   - FAQ
   - Видеоуроки

10. **Документы**
    - Политика конфиденциальности
    - Пользовательское соглашение

11. **Выход**

### 3.4 Страница добавления товара/услуги

#### Форма добавления
```javascript
interface ProductForm {
  title: string; // до 100 символов
  description: string; // до 2000 символов
  category: {
    level1: string;
    level2: string;
    level3: string;
  };
  images: File[]; // до 10 штук, обрезка 350x350, превью 150x150
  price: number;
  discountPrice?: number;
  discountPercent?: number; // автоматический расчет и отображение
  characteristics: Array<{
    name: string;
    value: string;
  }>; // до 10 характеристик
  delivery: {
    type: 'pickup' | 'paid' | 'free';
    methods?: string[]; // если paid: taxi, express, cargo, truck, air, own_car
  };
  partnerPercent?: number; // только для Business тарифа, 0-100%
}
```

#### Валидация и подсказки
- Подсказки под каждым полем
- Валидация в реальном времени
- Превью загружаемых изображений
- Drag & drop для изображений
- Автосохранение черновика

### 3.5 Партнерские товары

#### Условия отображения
- Только товары продавцов с тарифом Business
- Партнерский процент ≥ 2%

#### Распределение комиссии
При покупке через партнерскую ссылку:
- 40% от партнерского процента → реферальный баланс партнера
- 60% от партнерского процента → баланс платформы

#### Интерфейс
- Фильтры по категориям и проценту
- Генератор партнерских ссылок
- Статистика переходов и конверсии
- Кнопки шаринга

### 3.6 Страница товара/услуги

#### Структура
1. **Галерея изображений** с zoom и полноэкранным просмотром
2. **Информационный блок**:
   - Название
   - Рейтинг и отзывы
   - Цена (старая и новая при скидке)
   - Характеристики
   - Описание

3. **Блок продавца**:
   - Лого и название
   - Рейтинг
   - Город и тип
   - Ссылка на профиль

4. **Фиксированная панель** (внизу на мобильных, справа на десктопе):
   - Кнопка "Заказать"
   - Кнопка "Написать продавцу"
   - Добавить в избранное

5. **Похожие товары** (рекомендации)

## 4. Система чата

### 4.1 Функциональность
```javascript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  text: string;
  attachments?: {
    productId?: string;
    productTitle?: string;
    productImage?: string;
    productPrice?: number;
  };
  isRead: boolean;
  createdAt: Date;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  productContext?: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
}
```

### 4.2 Ограничения и фильтрация
- Автоматическая маскировка телефонных номеров (regex: /\+?\d{10,15}/)
- Маскировка банковских карт (regex: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/)
- Фильтрация нецензурной лексики
- Список запрещенных слов (настраивается в админке)
- Real-time уведомления через WebSocket

## 5. Тарифные планы

### 5.1 Free (Бесплатный)
```javascript
const FreeTariff = {
  name: 'Free',
  price: 0,
  features: {
    maxProducts: 10,
    maxUnpublished: 1000,
    showInCatalog: false,
    promotionPrice: 20, // сом за поднятие
    autoPromotion: false,
    partnerProgram: false,
    onlinePayments: false
  }
};
```

### 5.2 Pro
```javascript
const ProTariff = {
  name: 'Pro',
  price: 500, // сом/месяц
  features: {
    maxProducts: 100,
    maxUnpublished: 1000,
    showInCatalog: true,
    promotionPrice: 15,
    autoPromotion: {
      enabled: true,
      minInterval: 30, // минут
      price: 15
    },
    partnerProgram: false,
    onlinePayments: true
  }
};
```

### 5.3 Business
```javascript
const BusinessTariff = {
  name: 'Business',
  price: 2000, // сом/месяц
  features: {
    maxProducts: 1000,
    maxUnpublished: 1000,
    showInCatalog: true,
    promotionPrice: 10,
    autoPromotion: {
      enabled: true,
      minInterval: 30,
      price: 10
    },
    partnerProgram: true, // может устанавливать % для партнеров
    onlinePayments: true,
    analytics: true // расширенная аналитика
  }
};
```

## 6. Партнерская программа

### 6.1 Реферальная система для регистрации
```javascript
interface ReferralSystem {
  referralId: string; // уникальный ID, не user_id
  referralLink: string; // bazarlar.online/ref/{referralId}
  cookieLifetime: 30, // дней
  cashbackPercent: 10, // % от пополнений реферала
  
  // Начисления
  onReferralTopUp: (amount: number) => {
    referrerBonus = amount * 0.1; // 10% кешбэк рефереру
    // Реферал получает 100% на основной баланс
    // Реферер получает 10% на реферальный баланс
  }
}
```

### 6.2 Партнерская программа для товаров
```javascript
interface ProductAffiliate {
  minPercent: 2, // минимальный % для участия
  
  distribution: {
    partner: 40, // % от партнерского процента
    platform: 60 // % от партнерского процента
  },
  
  // Пример: товар 1000 сом, партнерский % = 10%
  // Комиссия = 100 сом
  // Партнер получает: 100 * 0.4 = 40 сом
  // Платформа получает: 100 * 0.6 = 60 сом
  
  trackingCookie: {
    lifetime: 1, // день
    parameter: 'ref' // bazarlar.online/product/123?ref={referralId}
  }
}
```

### 6.3 Система выплат
```javascript
interface Withdrawal {
  minAmount: 3000, // минимальная сумма вывода в сомах
  methods: ['mbank'], // доступные методы
  
  request: {
    amount: number;
    method: 'mbank';
    accountNumber: string; // номер Мбанка
    accountName: string; // имя владельца
  },
  
  statuses: ['pending', 'approved', 'rejected'],
  
  // Заявки обрабатываются кассиром в админке
  processing: 'manual'
}
```

## 7. Система платежей

### 7.1 Внутренний кошелек
```javascript
interface WalletSystem {
  currency: 'KGS',
  
  balances: {
    main: number, // основной (для внутренних платежей)
    referral: number // реферальный (можно выводить)
  },
  
  operations: {
    topUp: {
      methods: ['mbank'], // интеграция эквайринга
      minAmount: 100,
      maxAmount: 100000
    },
    
    internalTransfer: {
      from: 'referral',
      to: 'main',
      commission: 0
    },
    
    withdrawal: {
      from: 'referral',
      minAmount: 3000,
      commission: 0,
      method: 'mbank'
    }
  }
}
```

### 7.2 Интеграция Мбанк эквайринга
```javascript
interface MbankIntegration {
  provider: 'MBank Kyrgyzstan',
  
  endpoints: {
    payment: '/api/payment/create',
    status: '/api/payment/status',
    refund: '/api/payment/refund'
  },
  
  callbacks: {
    success: '/payment/success',
    fail: '/payment/fail',
    pending: '/payment/pending'
  },
  
  // Средства от продаж поступают на реферальный баланс продавца
  sellerSettlement: 'referral_balance'
}
```

## 8. Система поднятия объявлений

### 8.1 Ручное поднятие
```javascript
interface ManualPromotion {
  prices: {
    free: 20,
    pro: 15,
    business: 10
  },
  
  effect: 'Перемещение в начало списка',
  duration: 'До следующего поднятия'
}
```

### 8.2 Автоподнятие
```javascript
interface AutoPromotion {
  availability: ['Pro', 'Business'],
  
  settings: {
    startTime: string, // HH:mm
    endTime: string,
    frequency: number, // минимум 30 минут
    endDate: Date,
    enabled: boolean
  },
  
  prices: {
    pro: 15,
    business: 10
  },
  
  // Проверка баланса перед каждым поднятием
  balanceCheck: true,
  
  // Уведомление при недостатке средств
  lowBalanceNotification: true
}
```

## 9. Модерация контента

### 9.1 AI модерация изображений
```javascript
interface ImageModeration {
  provider: 'Google Cloud Vision API',
  
  checks: {
    adult: 'VERY_UNLIKELY',
    violence: 'VERY_UNLIKELY',
    medical: 'POSSIBLE', // разрешено с предупреждением
    spoof: 'VERY_UNLIKELY'
  },
  
  workflow: {
    // Автоматическое одобрение при прохождении всех проверок
    autoApprove: true,
    
    // Отправка на ручную модерацию при сомнениях
    manualReview: 'POSSIBLE' || 'LIKELY',
    
    // Автоматический отказ
    autoReject: 'VERY_LIKELY'
  }
}
```

### 9.2 Текстовая модерация
```javascript
interface TextModeration {
  filters: {
    profanity: true, // нецензурная лексика
    prohibited: true, // запрещенные слова
    contacts: true, // телефоны, email в описании
    duplicates: true // проверка на дубликаты
  },
  
  // Список запрещенных слов настраивается в админке
  prohibitedWords: string[],
  
  // Автоматическая нормализация текста
  normalization: {
    capitalizeTitle: true,
    removeDuplicateSpaces: true,
    trimWhitespace: true
  }
}
```

## 10. Административная панель

### 10.1 Структура меню
```typescript
interface AdminMenu {
  dashboard: {
    statistics: {
      platformWallet: number,
      products: {
        added: ChartData,
        sold: ChartData
      },
      referrals: {
        productReferrals: ChartData,
        registrationReferrals: ChartData
      },
      users: {
        total: number,
        active: number,
        byTariff: PieChartData
      }
    }
  },
  
  products: {
    list: ProductsList,
    actions: ['publish', 'unpublish', 'edit', 'delete'],
    bulkActions: true,
    filters: ['status', 'category', 'seller', 'date']
  },
  
  users: {
    list: UsersList,
    actions: ['ban', 'edit', 'message', 'viewTransactions'],
    roles: ['admin', 'cashier', 'moderator_products', 'moderator_full'],
    sellerProfile: 'Link to seller page'
  },
  
  moderation: {
    queue: ModerationQueue,
    history: ModerationHistory,
    aiSettings: AIConfigPanel
  },
  
  finance: {
    withdrawals: WithdrawalRequests,
    transactions: TransactionHistory,
    platformEarnings: EarningsReport
  },
  
  settings: {
    categories: CategoryManager,
    cities: CityManager,
    markets: MarketManager,
    prohibitedWords: WordFilter,
    seo: SEOSettings
  }
}
```

### 10.2 Роли администраторов
```javascript
const AdminRoles = {
  admin: {
    name: 'Администратор',
    permissions: ['*'] // все права
  },
  
  cashier: {
    name: 'Кассир',
    permissions: [
      'finance.withdrawals.view',
      'finance.withdrawals.process',
      'users.transactions.view'
    ]
  },
  
  moderator_products: {
    name: 'Модератор товаров',
    permissions: [
      'products.*',
      'moderation.products.*'
    ]
  },
  
  moderator_full: {
    name: 'Полный модератор',
    permissions: [
      'products.*',
      'users.edit',
      'users.ban',
      'moderation.*'
    ]
  }
};
```

### 10.3 Функции обработки выплат
```javascript
interface WithdrawalProcessing {
  statuses: {
    pending: 'Ожидает',
    processing: 'В обработке',
    approved: 'Переведено',
    rejected: 'Отклонено'
  },
  
  actions: {
    approve: {
      confirmTransfer: boolean, // подтверждение перевода
      deductBalance: true, // списание с реферального баланса
      notification: 'SMS + Email'
    },
    
    reject: {
      reason: string, // обязательное указание причины
      keepBalance: true, // баланс не списывается
      notification: 'SMS + Email'
    }
  },
  
  // Массовая обработка заявок
  bulkProcessing: true
}
```

## 11. SEO оптимизация

### 11.1 Мета-теги
```javascript
interface SEOConfig {
  pages: {
    home: {
      title: 'Bazarlar Online - Торговая площадка Кыргызстана',
      description: 'Покупайте и продавайте товары и услуги...',
      keywords: ['базар', 'рынок', 'товары', 'услуги', 'Кыргызстан']
    },
    
    product: {
      title: '{productName} - купить в {city} | Bazarlar Online',
      description: '{description}',
      ogImage: '{productImage}'
    },
    
    seller: {
      title: '{sellerName} - {category} | Bazarlar Online',
      description: 'Товары и услуги от {sellerName}...'
    }
  },
  
  sitemap: {
    generate: true,
    frequency: 'daily',
    priority: {
      home: 1.0,
      categories: 0.8,
      products: 0.6,
      sellers: 0.7
    }
  },
  
  robots: {
    allow: ['/', '/products', '/sellers'],
    disallow: ['/admin', '/api', '/profile']
  },
  
  structuredData: {
    organization: true,
    breadcrumbs: true,
    product: true,
    localBusiness: true
  }
}
```

### 11.2 URL структура
```
bazarlar.online/
├── /                           # Главная
├── /products/{id}             # Страница товара
├── /sellers                   # Каталог продавцов
├── /sellers/{id}              # Профиль продавца
├── /category/{slug}           # Товары категории
├── /partner-products          # Партнерские товары
├── /profile                   # Личный кабинет
├── /profile/products          # Мои объявления
├── /profile/orders            # Заказы
├── /profile/messages          # Сообщения
├── /profile/wallet            # Кошелек
├── /profile/partner           # Партнерская программа
└── /add                       # Добавить объявление
```

## 12. Безопасность

### 12.1 Аутентификация и авторизация
```javascript
interface AuthSystem {
  provider: 'Google OAuth 2.0',
  
  session: {
    storage: 'HttpOnly Secure Cookie',
    duration: 365, // дней
    refreshToken: true
  },
  
  jwt: {
    algorithm: 'RS256',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '365d'
  },
  
  permissions: {
    guest: ['view'],
    user: ['view', 'create', 'message'],
    seller: ['view', 'create', 'message', 'sell'],
    moderator: ['view', 'create', 'message', 'moderate'],
    admin: ['*']
  }
}
```

### 12.2 Защита данных
```javascript
interface DataProtection {
  encryption: {
    passwords: 'bcrypt', // хотя используем OAuth
    sensitiveData: 'AES-256',
    communications: 'TLS 1.3'
  },
  
  privacy: {
    // Банковские реквизиты НЕ хранятся
    bankDetails: 'NOT_STORED',
    
    // Персональные данные видны только в админке
    personalInfo: 'ADMIN_ONLY',
    
    // Маскировка в публичных местах
    phoneDisplay: 'MASKED' // +996 *** *** 12
  },
  
  rateLimit: {
    api: '100 req/min',
    auth: '5 attempts/15min',
    messages: '30 msg/min'
  },
  
  validation: {
    input: 'Strict typing + sanitization',
    files: 'Type check + virus scan',
    sql: 'Prepared statements only'
  }
}
```

## 13. База данных

### 13.1 Основные таблицы

```sql
-- Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    referral_id VARCHAR(20) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    tariff VARCHAR(20) DEFAULT 'free',
    tariff_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT
);

-- Профили продавцов
CREATE TABLE seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    description TEXT,
    banner_url VARCHAR(500),
    logo_url VARCHAR(500),
    category_id INTEGER REFERENCES categories(id),
    city_id INTEGER REFERENCES cities(id),
    seller_type VARCHAR(50),
    market_id INTEGER REFERENCES markets(id),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Товары и услуги
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    discount_percent INTEGER GENERATED ALWAYS AS 
        (CASE WHEN discount_price IS NOT NULL 
        THEN ROUND((1 - discount_price/price) * 100) 
        ELSE NULL END) STORED,
    partner_percent DECIMAL(5, 2) DEFAULT 0,
    delivery_type VARCHAR(20),
    delivery_methods JSONB,
    characteristics JSONB,
    images JSONB,
    status VARCHAR(20) DEFAULT 'moderation',
    moderation_result JSONB,
    is_promoted BOOLEAN DEFAULT FALSE,
    promoted_at TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Кошельки
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    main_balance DECIMAL(10, 2) DEFAULT 0,
    referral_balance DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'KGS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Транзакции
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50), -- topup, withdrawal, purchase, referral, promotion
    amount DECIMAL(10, 2) NOT NULL,
    balance_type VARCHAR(20), -- main, referral
    description TEXT,
    reference_id UUID, -- ссылка на заказ/вывод/etc
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заказы
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT,
    phone_number VARCHAR(20),
    payment_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    referral_id UUID REFERENCES users(id),
    referral_commission DECIMAL(10, 2),
    platform_commission DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Чаты
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID REFERENCES users(id),
    participant2_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant1_id, participant2_id, product_id)
);

-- Сообщения
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Отзывы
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id),
    buyer_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    rating INTEGER CHECK (rating >= 0 AND rating <= 10),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, buyer_id)
);

-- Категории
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    level INTEGER NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Города
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100),
    sort_order INTEGER DEFAULT 0
);

-- Рынки
CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- Автоподнятие
CREATE TABLE auto_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    frequency_minutes INTEGER NOT NULL CHECK (frequency_minutes >= 30),
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_promoted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заявки на вывод средств
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(20) DEFAULT 'mbank',
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_promoted ON products(is_promoted, promoted_at DESC);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_users_referral ON users(referral_id);
```

## 14. API спецификация

### 14.1 Структура API
```
Base URL: https://api.bazarlar.online/v1

Endpoints:
├── /auth
│   ├── POST /auth/google    # OAuth авторизация
│   ├── POST /auth/refresh   # Обновление токена
│   └── POST /auth/logout    # Выход
│
├── /users
│   ├── GET /users/me        # Текущий пользователь
│   ├── PUT /users/me        # Обновление профиля
│   └── GET /users/{id}      # Профиль пользователя
│
├── /products
│   ├── GET /products        # Список товаров
│   ├── POST /products       # Создание товара
│   ├── GET /products/{id}   # Детали товара
│   ├── PUT /products/{id}   # Обновление товара
│   ├── DELETE /products/{id} # Удаление товара
│   └── POST /products/{id}/promote # Поднятие
│
├── /orders
│   ├── GET /orders          # Список заказов
│   ├── POST /orders         # Создание заказа
│   ├── GET /orders/{id}     # Детали заказа
│   └── PUT /orders/{id}/status # Изменение статуса
│
├── /wallet
│   ├── GET /wallet/balance  # Баланс
│   ├── POST /wallet/topup   # Пополнение
│   ├── POST /wallet/withdraw # Вывод средств
│   └── GET /wallet/transactions # История
│
├── /chat
│   ├── GET /chat/conversations # Список диалогов
│   ├── GET /chat/{id}/messages # Сообщения
│   └── POST /chat/send      # Отправка сообщения
│
├── /referral
│   ├── GET /referral/stats  # Статистика
│   ├── GET /referral/link   # Получить ссылку
│   └── GET /referral/products # Партнерские товары
│
└── /admin
    ├── GET /admin/stats     # Статистика
    ├── GET /admin/users     # Пользователи
    ├── GET /admin/products  # Товары
    └── GET /admin/withdrawals # Заявки на вывод
```

### 14.2 Примеры запросов

#### Получение списка товаров
```http
GET /v1/products?type=goods&category=electronics&city=bishkek&limit=30&offset=0

Response:
{
  "items": [
    {
      "id": "uuid",
      "title": "iPhone 15 Pro",
      "price": 120000,
      "discount_price": 110000,
      "discount_percent": 8,
      "images": ["url1", "url2"],
      "seller": {
        "id": "uuid",
        "name": "TechStore",
        "logo": "url",
        "rating": 4.5,
        "city": "Бишкек",
        "type": "shop"
      }
    }
  ],
  "total": 1250,
  "has_more": true
}
```

#### Создание заказа
```http
POST /v1/orders
{
  "seller_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 110000
    }
  ],
  "delivery_address": "ул. Чуй 123",
  "phone_number": "+996555123456",
  "payment_method": "wallet"
}

Response:
{
  "id": "uuid",
  "order_number": "ORD-20250105-0001",
  "total_amount": 220000,
  "status": "pending",
  "payment_url": "https://payment.mbank.kg/..."
}
```

## 15. WebSocket события

### 15.1 События чата
```javascript
// Клиент -> Сервер
socket.emit('join', { userId });
socket.emit('message:send', { chatId, text });
socket.emit('message:read', { messageId });
socket.emit('typing', { chatId, isTyping });

// Сервер -> Клиент
socket.on('message:new', (message) => {});
socket.on('message:read', ({ messageId, readBy }) => {});
socket.on('typing', ({ chatId, userId, isTyping }) => {});
socket.on('user:online', ({ userId, isOnline }) => {});
```

### 15.2 События уведомлений
```javascript
// Сервер -> Клиент
socket.on('notification', {
  type: 'order' | 'message' | 'promotion' | 'withdrawal',
  title: string,
  message: string,
  data: any
});
```

## 16. Планы развития

### Фаза 1 (MVP) - 2 месяца
- Базовая функциональность платформы
- Регистрация и авторизация через Google
- Добавление и просмотр товаров
- Простой чат
- Базовая админка

### Фаза 2 (Расширение) - 1 месяц
- Система тарифов
- Внутренний кошелек
- Партнерская программа
- AI модерация

### Фаза 3 (Монетизация) - 1 месяц
- Интеграция Мбанк эквайринга
- Система выплат
- Автоподнятие объявлений
- Расширенная аналитика

### Фаза 4 (Оптимизация) - Ongoing
- SEO оптимизация
- Мобильные приложения
- Интеграция с маркетплейсами
- Система рекомендаций

## 17. Требования к хостингу

### Development
```yaml
Environment: Local
OS: Windows 11
Server: Node.js + Python
Database: PostgreSQL (Docker)
Storage: Local filesystem
```

### Production (Beget.com)
```yaml
Server:
  CPU: 4 cores minimum
  RAM: 8 GB minimum
  Storage: 100 GB SSD
  
Software:
  OS: Ubuntu 22.04 LTS
  Web Server: Nginx 1.24+
  Node.js: 20.x LTS
  Python: 3.12+
  PostgreSQL: 16+
  Redis: 7.0+
  
Network:
  SSL: Let's Encrypt
  CDN: Cloudflare (optional)
  Backup: Daily automated
```

## 18. Мониторинг и аналитика

### 18.1 Метрики
- Количество пользователей (DAU, MAU)
- Количество товаров и транзакций
- Конверсия посетителей в покупателей
- Средний чек
- Доход платформы
- Производительность API

### 18.2 Инструменты
- Google Analytics 4
- Яндекс.Метрика
- Sentry (error tracking)
- Prometheus + Grafana (системные метрики)

## 19. Правовые аспекты

### 19.1 Документы
- Пользовательское соглашение
- Политика конфиденциальности
- Договор оферты
- Правила размещения товаров
- Политика возврата

### 19.2 Соответствие законодательству
- Закон о защите персональных данных КР
- Закон об электронной коммерции
- Налоговое законодательство
- Требования к финансовым операциям

## 20. Контрольный чеклист перед запуском

### Технический
- [ ] SSL сертификат установлен
- [ ] Backup настроен и протестирован
- [ ] Мониторинг работает
- [ ] API документирован
- [ ] Нагрузочное тестирование пройдено

### Функциональный
- [ ] Регистрация/авторизация работает
- [ ] Товары добавляются и отображаются
- [ ] Платежи проходят корректно
- [ ] Чат функционирует
- [ ] Админка доступна

### Контент
- [ ] Категории заполнены
- [ ] Города и рынки добавлены
- [ ] Правовые документы размещены
- [ ] FAQ подготовлен
- [ ] Обучающие материалы готовы

### Маркетинг
- [ ] SEO настроено
- [ ] Аналитика подключена
- [ ] Social media аккаунты созданы
- [ ] Рекламная кампания подготовлена

---

## Заключение

Данное техническое задание описывает полный функционал платформы Bazarlar Online. При разработке следует придерживаться принципов:

1. **Mobile-first** - приоритет мобильной версии
2. **Performance** - оптимизация скорости загрузки
3. **Security** - безопасность данных пользователей
4. **Scalability** - возможность масштабирования
5. **User Experience** - удобство использования

Разработка должна вестись итеративно, с регулярным тестированием и получением обратной связи от пользователей.

---

**Версия документа**: 1.0  
**Дата создания**: 05.01.2025  
**Автор**: Claude AI Assistant для Bazarlar Online
