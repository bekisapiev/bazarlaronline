"""
Security Logger Middleware для отслеживания подозрительной активности
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging
from datetime import datetime
import json

# Настройка логгера
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security.log'),
        logging.StreamHandler()
    ]
)

security_logger = logging.getLogger('security')


class SecurityLoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware для логирования подозрительной активности и попыток атак
    """
    def __init__(self, app):
        super().__init__(app)
        self.suspicious_patterns = [
            # SQL Injection паттерны
            "' OR '1'='1",
            "' OR 1=1--",
            "UNION SELECT",
            "DROP TABLE",
            "INSERT INTO",
            "DELETE FROM",
            "UPDATE SET",
            "CREATE TABLE",

            # XSS паттерны
            "<script",
            "javascript:",
            "onerror=",
            "onload=",

            # Path Traversal
            "../",
            "..\\",
            "/etc/passwd",
            "/proc/",

            # Command Injection
            ";cat ",
            "|cat ",
            "&cat ",
            "&&",
            "||",
            ";ls ",

            # LDAP Injection
            "*)(uid=*",
            "admin)(|(password=*",
        ]

        # Чувствительные endpoints для более детального логирования
        self.sensitive_endpoints = [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/google",
            "/api/v1/auth/telegram",
            "/api/v1/users/me",
            "/api/v1/admin/",
        ]

    def is_suspicious(self, text: str) -> bool:
        """Проверяет текст на наличие подозрительных паттернов"""
        if not text:
            return False

        text_lower = text.lower()
        for pattern in self.suspicious_patterns:
            if pattern.lower() in text_lower:
                return True
        return False

    def get_client_info(self, request: Request) -> dict:
        """Собирает информацию о клиенте"""
        client_ip = request.client.host if request.client else "unknown"

        # Реальный IP для проксированных запросов
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        return {
            "ip": client_ip,
            "user_agent": request.headers.get("User-Agent", "unknown"),
            "referer": request.headers.get("Referer", "none"),
            "method": request.method,
            "path": request.url.path,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def dispatch(self, request: Request, call_next):
        client_info = self.get_client_info(request)

        # Проверка URL на подозрительные паттерны
        if self.is_suspicious(str(request.url)):
            security_logger.warning(
                f"🚨 SUSPICIOUS URL PATTERN DETECTED: {json.dumps(client_info, ensure_ascii=False)}"
            )

        # Проверка query parameters
        for key, value in request.query_params.items():
            if self.is_suspicious(key) or self.is_suspicious(value):
                security_logger.warning(
                    f"🚨 SUSPICIOUS QUERY PARAMETER: {key}={value[:100]} | {json.dumps(client_info, ensure_ascii=False)}"
                )

        # Проверка headers на подозрительные значения
        for key, value in request.headers.items():
            if self.is_suspicious(value):
                security_logger.warning(
                    f"🚨 SUSPICIOUS HEADER: {key}={value[:100]} | {json.dumps(client_info, ensure_ascii=False)}"
                )

        # Логируем доступ к чувствительным endpoints
        if any(endpoint in request.url.path for endpoint in self.sensitive_endpoints):
            security_logger.info(
                f"🔐 SENSITIVE ENDPOINT ACCESS: {json.dumps(client_info, ensure_ascii=False)}"
            )

        # Выполняем запрос
        response = await call_next(request)

        # Логируем неудачные попытки аутентификации
        if response.status_code == 401:
            security_logger.warning(
                f"🔒 FAILED AUTHENTICATION: {json.dumps(client_info, ensure_ascii=False)}"
            )

        # Логируем запрещенные доступы
        if response.status_code == 403:
            security_logger.warning(
                f"⛔ FORBIDDEN ACCESS ATTEMPT: {json.dumps(client_info, ensure_ascii=False)}"
            )

        # Логируем rate limit срабатывания
        if response.status_code == 429:
            security_logger.warning(
                f"⚠️  RATE LIMIT EXCEEDED: {json.dumps(client_info, ensure_ascii=False)}"
            )

        # Логируем server errors (могут указывать на атаку)
        if response.status_code >= 500:
            security_logger.error(
                f"💥 SERVER ERROR: Status {response.status_code} | {json.dumps(client_info, ensure_ascii=False)}"
            )

        return response
