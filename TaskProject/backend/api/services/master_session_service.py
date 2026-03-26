from api.db.master_session_db import is_master_session_active_db


def validate_master_session_service(session_token: str) -> bool:
    if not session_token:
        return False

    return is_master_session_active_db(session_token)