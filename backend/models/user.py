from db_config import get_db_connection

def save_user_token(user_id, access_token):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "REPLACE INTO users (user_id, access_token) VALUES (%s, %s)",
        (user_id, access_token)
    )
    conn.commit()
    cursor.close()
    conn.close()

def get_user_token(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT access_token FROM users WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result[0] if result else None
