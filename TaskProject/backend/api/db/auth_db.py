from typing import Optional, Tuple
from django.db import connection


def get_user_by_email(email: str) -> Optional[Tuple[int, str, str, str, str]]:
    with connection.cursor() as cur:
        cur.execute("SELECT * FROM fn_auth_user_by_email(%s)", [email])
        return cur.fetchone()


def user_exists(user_id: int) -> bool:
    with connection.cursor() as cur:
        cur.execute("SELECT fn_auth_user_exists(%s)", [user_id])
        return bool(cur.fetchone()[0])


def revoke_refresh_token(token_hash: str) -> None:
    with connection.cursor() as cur:
        cur.callproc("sp_auth_revoke_refresh_token", [token_hash])


def get_user_by_id(user_id: int):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, name, email, role
            FROM users
            WHERE id = %s
            LIMIT 1
            """,
            [user_id],
        )
        row = cursor.fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "role": row[3],
    }        