"""
Validators и санитизаторы для входных данных
"""
import re
from typing import Optional
from fastapi import HTTPException, status
import html


class InputValidator:
    """
    Класс для валидации и санитизации входных данных
    """

    # Регулярные выражения для валидации
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE_REGEX = re.compile(r'^\+?[0-9]{10,15}$')
    USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_-]{3,30}$')
    SAFE_STRING_REGEX = re.compile(r'^[a-zA-Z0-9\s\-_.,!?()]+$')

    # Опасные паттерны для SQL Injection
    SQL_INJECTION_PATTERNS = [
        r"(\bOR\b|\bAND\b).*=.*",
        r"UNION.*SELECT",
        r"DROP\s+TABLE",
        r"INSERT\s+INTO",
        r"DELETE\s+FROM",
        r"UPDATE.*SET",
        r"--",
        r";.*",
        r"\/\*.*\*\/",
        r"xp_cmdshell",
        r"exec\s*\(",
    ]

    # Опасные паттерны для XSS
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe",
        r"<embed",
        r"<object",
    ]

    # Опасные паттерны для Path Traversal
    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.",
        r"~\/",
        r"\/etc\/",
        r"\/proc\/",
        r"\\\\",
    ]

    @classmethod
    def sanitize_html(cls, text: str) -> str:
        """
        Экранирует HTML специальные символы для предотвращения XSS

        Args:
            text: Исходная строка

        Returns:
            Экранированная строка
        """
        if not text:
            return text
        return html.escape(text)

    @classmethod
    def validate_email(cls, email: str) -> str:
        """
        Валидирует email адрес

        Args:
            email: Email для проверки

        Returns:
            Валидный email в lowercase

        Raises:
            HTTPException: Если email невалиден
        """
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )

        email = email.strip().lower()

        if len(email) > 255:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is too long"
            )

        if not cls.EMAIL_REGEX.match(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )

        return email

    @classmethod
    def validate_phone(cls, phone: str) -> str:
        """
        Валидирует номер телефона

        Args:
            phone: Номер телефона для проверки

        Returns:
            Валидный номер телефона

        Raises:
            HTTPException: Если номер невалиден
        """
        if not phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is required"
            )

        # Удаляем пробелы и дефисы
        phone = re.sub(r'[\s\-()]', '', phone)

        if not cls.PHONE_REGEX.match(phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format"
            )

        return phone

    @classmethod
    def validate_password(cls, password: str) -> str:
        """
        Валидирует пароль

        Args:
            password: Пароль для проверки

        Returns:
            Валидный пароль

        Raises:
            HTTPException: Если пароль невалиден
        """
        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )

        if len(password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )

        if len(password) > 128:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long"
            )

        return password

    @classmethod
    def check_sql_injection(cls, text: str) -> None:
        """
        Проверяет текст на SQL injection паттерны

        Args:
            text: Текст для проверки

        Raises:
            HTTPException: Если обнаружены подозрительные паттерны
        """
        if not text:
            return

        text_upper = text.upper()

        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, text_upper, re.IGNORECASE):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected"
                )

    @classmethod
    def check_xss(cls, text: str) -> None:
        """
        Проверяет текст на XSS паттерны

        Args:
            text: Текст для проверки

        Raises:
            HTTPException: Если обнаружены подозрительные паттерны
        """
        if not text:
            return

        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input detected"
                )

    @classmethod
    def check_path_traversal(cls, path: str) -> None:
        """
        Проверяет путь на path traversal атаки

        Args:
            path: Путь для проверки

        Raises:
            HTTPException: Если обнаружены подозрительные паттерны
        """
        if not path:
            return

        for pattern in cls.PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, path, re.IGNORECASE):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid path"
                )

    @classmethod
    def sanitize_string(cls, text: str, max_length: int = 1000) -> str:
        """
        Санитизирует строку от опасных символов

        Args:
            text: Строка для санитизации
            max_length: Максимальная длина строки

        Returns:
            Санитизированная строка
        """
        if not text:
            return text

        # Обрезаем до максимальной длины
        text = text[:max_length]

        # Проверяем на SQL injection и XSS
        cls.check_sql_injection(text)
        cls.check_xss(text)

        # Экранируем HTML
        text = cls.sanitize_html(text)

        return text.strip()

    @classmethod
    def validate_integer(cls, value: any, min_value: int = None, max_value: int = None) -> int:
        """
        Валидирует целое число

        Args:
            value: Значение для проверки
            min_value: Минимальное значение
            max_value: Максимальное значение

        Returns:
            Валидное целое число

        Raises:
            HTTPException: Если значение невалидно
        """
        try:
            int_value = int(value)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid integer value"
            )

        if min_value is not None and int_value < min_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Value must be at least {min_value}"
            )

        if max_value is not None and int_value > max_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Value must be at most {max_value}"
            )

        return int_value

    @classmethod
    def validate_uuid(cls, uuid_string: str) -> str:
        """
        Валидирует UUID строку

        Args:
            uuid_string: UUID строка для проверки

        Returns:
            Валидная UUID строка

        Raises:
            HTTPException: Если UUID невалиден
        """
        import uuid

        if not uuid_string:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="UUID is required"
            )

        try:
            uuid.UUID(uuid_string)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid UUID format"
            )

        return uuid_string.lower()


# Экспортируем экземпляр для удобства использования
validator = InputValidator()
