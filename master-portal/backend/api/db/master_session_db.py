from django.db import connection


def create_master_user_session_db(master_user_id, session_token):
    with connection.cursor() as cur:
        cur.execute(
            "SELECT * FROM fn_create_master_user_session(%s, %s)",
            [master_user_id, session_token],
        )
        row = cur.fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "master_user_id": row[1],
        "session_token": row[2],
        "is_active": row[3],
        "created_at": row[4],
        "updated_at": row[5],
        "logged_out_at": row[6],
    }


def logout_master_user_session_db(session_token):
    with connection.cursor() as cur:
        cur.execute(
            "SELECT fn_logout_master_user_session(%s)",
            [session_token],
        )
        row = cur.fetchone()

    return bool(row[0]) if row else False


def is_master_session_active_db(master_user_id, session_token):
    with connection.cursor() as cur:
        cur.execute(
            "SELECT fn_is_master_session_active(%s, %s)",
            [master_user_id, session_token],
        )
        row = cur.fetchone()

    return bool(row[0]) if row else False