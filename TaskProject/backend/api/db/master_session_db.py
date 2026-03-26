import requests


MASTER_BACKEND_BASE_URL = "http://127.0.0.1:8000"


def is_master_session_active_db(session_token: str) -> bool:
    response = requests.get(
        f"{MASTER_BACKEND_BASE_URL}/portal/master-session-status/",
        params={"session_token": session_token},
        timeout=5,
    )

    if response.status_code != 200:
        return False

    data = response.json()
    return bool(data.get("is_active"))