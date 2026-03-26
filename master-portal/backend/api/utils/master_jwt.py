import jwt
import secrets
from datetime import datetime, timedelta, timezone
from django.conf import settings


def generate_master_session_token():
    return secrets.token_urlsafe(48)


def generate_master_token(user, session_token, token_type="access"):
    now = datetime.now(timezone.utc)

    if token_type == "access":
        exp = now + timedelta(minutes=settings.MASTER_ACCESS_MINUTES)
    elif token_type == "refresh":
        exp = now + timedelta(days=settings.MASTER_REFRESH_DAYS)
    else:
        raise ValueError("Invalid token type")

    payload = {
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "session_token": session_token,
        "type": token_type,
        "iat": now,
        "exp": exp,
    }

    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)