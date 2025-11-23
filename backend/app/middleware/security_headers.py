"""
Security Headers Middleware для защиты от различных атак
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware для добавления заголовков безопасности

    Защищает от:
    - XSS (Cross-Site Scripting)
    - Clickjacking
    - MIME-sniffing
    - Downgrade атак
    - И других угроз
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Content Security Policy - защита от XSS
        # Разрешаем загрузку ресурсов только с доверенных источников
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://accounts.google.com https://www.googleapis.com",
            "frame-src 'self' https://accounts.google.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            "upgrade-insecure-requests"
        ]

        # В production добавляем более строгие правила
        if settings.ENVIRONMENT == "production":
            response.headers["Content-Security-Policy"] = "; ".join(csp_directives)
        else:
            # В development режиме CSP может мешать, делаем report-only
            response.headers["Content-Security-Policy-Report-Only"] = "; ".join(csp_directives)

        # Strict-Transport-Security - принудительное использование HTTPS
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # X-Content-Type-Options - защита от MIME-sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # X-Frame-Options - защита от clickjacking
        response.headers["X-Frame-Options"] = "SAMEORIGIN"

        # X-XSS-Protection - дополнительная защита от XSS в старых браузерах
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer-Policy - контроль передачи referrer
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions-Policy - контроль доступа к API браузера
        permissions = [
            "accelerometer=()",
            "camera=()",
            "geolocation=(self)",
            "gyroscope=()",
            "magnetometer=()",
            "microphone=()",
            "payment=()",
            "usb=()"
        ]
        response.headers["Permissions-Policy"] = ", ".join(permissions)

        # Remove server header для скрытия информации о сервере
        if "Server" in response.headers:
            del response.headers["Server"]

        # X-Permitted-Cross-Domain-Policies - защита для Adobe продуктов
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

        # Cache-Control для чувствительных данных
        if "/api/v1/auth/" in request.url.path or "/api/v1/users/me" in request.url.path:
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"

        return response
