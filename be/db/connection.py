import mysql.connector
from core.config import DB_CONFIG

def get_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
    return None
