from datetime import datetime, timedelta, timezone
import bcrypt
from jose import jwt

from app.core.config import settings


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """Verifies a plain-text password against a stored bcrypt hash string."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hashes a plain-text password securely using modern bcrypt."""
    # Encode password string to bytes
    password_bytes = password.encode("utf-8")
    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    # Return as standard string for database storage
    return hashed_bytes.decode("utf-8")


def create_access_token(
    data: dict,
    expires_minutes: int | None = None,
) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=(
            expires_minutes
            or settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update(
        {
            "exp": expire,
        }
    )

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
