from db_config import get_db_connection
import json
from datetime import datetime

def save_stock_query(user_id, symbol, exchange, result):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO stock_queries (user_id, symbol, exchange, price, ohlc, margin, query_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        user_id,
        symbol,
        exchange,
        result.get("last_price"),
        json.dumps(result.get("ohlc")),
        json.dumps(result.get("margin")),
        datetime.now()
    ))
    conn.commit()
    cursor.close()
    conn.close()
