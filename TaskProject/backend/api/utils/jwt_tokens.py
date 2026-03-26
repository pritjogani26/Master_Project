import jwt
from datetime import datetime, timedelta, timezone as dt_timezone
from django.conf import settings

ACCESS_MINUTES = 15
REFRESH_DAYS = 7


def make_access(user_id, role, master_session_token=None):
    exp = datetime.now(dt_timezone.utc) + timedelta(minutes=ACCESS_MINUTES)

    payload = {
        "user_id": user_id,
        "role": role,
        "type": "access",
        "exp": exp,
    }

    if master_session_token:
        payload["master_session_token"] = master_session_token

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALG,
    )


def make_refresh(user_id, role, master_session_token=None):
    exp = datetime.now(dt_timezone.utc) + timedelta(days=REFRESH_DAYS)

    payload = {
        "user_id": user_id,
        "role": role,
        "type": "refresh",
        "exp": exp,
    }

    if master_session_token:
        payload["master_session_token"] = master_session_token

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALG,
    )