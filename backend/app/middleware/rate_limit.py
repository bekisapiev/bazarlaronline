"""
Rate Limiting Middleware для защиты от брутфорс атак
"""
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Tuple
from datetime import datetime, timedelta
import asyncio


class RateLimiter:
    """
    In-memory rate limiter с скользящим окном
    """
    def __init__(self):
        # Структура: {ip: [(timestamp, endpoint), ...]}
        self.requests: Dict[str, list] = {}
        self.lock = asyncio.Lock()

        # Настройки лимитов (запросов в минуту)
        self.limits = {
            "/api/v1/auth/login": 5,           # 5 попыток входа в минуту
            "/api/v1/auth/register": 3,        # 3 регистрации в минуту
            "/api/v1/auth/google": 10,         # 10 Google auth в минуту
            "/api/v1/auth/telegram": 10,       # 10 Telegram auth в минуту
            "/api/v1/auth/refresh": 20,        # 20 обновлений токена в минуту
            "default": 100                     # 100 запросов в минуту по умолчанию
        }

        # Время блокировки после превышения лимита (в минутах)
        self.block_duration = 15

        # Структура для хранения заблокированных IP
        self.blocked: Dict[str, datetime] = {}

    async def is_allowed(self, ip: str, path: str) -> Tuple[bool, int]:
        """
        Проверяет, разрешен ли запрос

        Returns:
            Tuple[bool, int]: (разрешен ли запрос, осталось попыток)
        """
        async with self.lock:
            now = datetime.utcnow()

            # Проверяем, заблокирован ли IP
            if ip in self.blocked:
                if now < self.blocked[ip]:
                    # Все еще заблокирован
                    remaining_time = (self.blocked[ip] - now).seconds
                    return False, -remaining_time
                else:
                    # Время блокировки истекло
                    del self.blocked[ip]
                    if ip in self.requests:
                        self.requests[ip] = []

            # Получаем лимит для данного endpoint
            limit = self.limits.get(path, self.limits["default"])

            # Очищаем старые запросы (старше 1 минуты)
            if ip in self.requests:
                self.requests[ip] = [
                    (ts, ep) for ts, ep in self.requests[ip]
                    if now - ts < timedelta(minutes=1)
                ]
            else:
                self.requests[ip] = []

            # Считаем запросы к этому endpoint за последнюю минуту
            endpoint_requests = [
                ts for ts, ep in self.requests[ip]
                if ep == path
            ]

            # Проверяем лимит
            if len(endpoint_requests) >= limit:
                # Блокируем IP на заданное время
                self.blocked[ip] = now + timedelta(minutes=self.block_duration)
                return False, 0

            # Добавляем текущий запрос
            self.requests[ip].append((now, path))

            # Возвращаем количество оставшихся попыток
            remaining = limit - len(endpoint_requests) - 1
            return True, remaining

    async def cleanup_old_records(self):
        """
        Периодическая очистка старых записей (для экономии памяти)
        """
        while True:
            await asyncio.sleep(300)  # Каждые 5 минут
            async with self.lock:
                now = datetime.utcnow()

                # Очищаем старые запросы
                for ip in list(self.requests.keys()):
                    self.requests[ip] = [
                        (ts, ep) for ts, ep in self.requests[ip]
                        if now - ts < timedelta(minutes=5)
                    ]
                    if not self.requests[ip]:
                        del self.requests[ip]

                # Очищаем истекшие блокировки
                for ip in list(self.blocked.keys()):
                    if now >= self.blocked[ip]:
                        del self.blocked[ip]


# Глобальный экземпляр rate limiter
rate_limiter = RateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware для ограничения количества запросов (Rate Limiting)
    """
    def __init__(self, app, limiter: RateLimiter = None):
        super().__init__(app)
        self.limiter = limiter or rate_limiter
        # Запускаем фоновую задачу для очистки
        asyncio.create_task(self.limiter.cleanup_old_records())

    async def dispatch(self, request: Request, call_next):
        # Пропускаем проверку для health check и статических файлов
        if request.url.path in ["/health", "/", "/api/docs", "/api/redoc"] or \
           request.url.path.startswith("/uploads/"):
            return await call_next(request)

        # Получаем IP адрес клиента
        client_ip = request.client.host if request.client else "unknown"

        # Для проксированных запросов получаем реальный IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        # Проверяем лимит
        is_allowed, remaining = await self.limiter.is_allowed(
            client_ip,
            request.url.path
        )

        if not is_allowed:
            # Запрос заблокирован
            if remaining < 0:
                # IP временно заблокирован
                retry_after = abs(remaining)
                return Response(
                    content=f'{{"detail":"Too many requests. Please try again in {retry_after} seconds."}}',
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    headers={
                        "Retry-After": str(retry_after),
                        "Content-Type": "application/json"
                    }
                )
            else:
                # Лимит исчерпан
                return Response(
                    content='{"detail":"Rate limit exceeded. Please try again later."}',
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    headers={
                        "Retry-After": "60",
                        "Content-Type": "application/json"
                    }
                )

        # Добавляем headers с информацией о лимитах
        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response
