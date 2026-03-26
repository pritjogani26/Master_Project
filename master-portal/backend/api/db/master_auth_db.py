from django.db import connection


def get_master_user_by_email(email):
    with connection.cursor() as cur:
        cur.execute(
            "SELECT fn_get_master_user_by_email(%s)",
            [email]
        )
        result = cur.fetchone()[0]

    return result  