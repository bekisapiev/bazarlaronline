"""
Error Handler Middleware для безопасной обработки ошибок
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import traceback
from app.core.config import settings

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Middleware для безопасной обработки ошибок

    В production не показывает детали ошибок пользователям,
    но логирует их для отладки
    """
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            # Логируем полную информацию об ошибке
            logger.error(
                f"Unhandled exception: {str(exc)}\n"
                f"Path: {request.url.path}\n"
                f"Method: {request.method}\n"
                f"Client: {request.client.host if request.client else 'unknown'}\n"
                f"Traceback:\n{traceback.format_exc()}"
            )

            # В development показываем детали ошибки
            if settings.ENVIRONMENT == "development":
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={
                        "detail": "Internal server error",
                        "error": str(exc),
                        "type": type(exc).__name__,
                        "traceback": traceback.format_exc() if settings.ENVIRONMENT == "development" else None
                    }
                )

            # В production показываем только общее сообщение
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "Internal server error. Please try again later or contact support."
                }
            )
