from api.db.master_session_db import is_master_session_active_db


def master_session_service(master_user_id, session_token):
    is_active = is_master_session_active_db(master_user_id, session_token)

    return {
        "master_user_id": master_user_id,
        "is_active": is_active,
    }