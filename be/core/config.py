import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "agricultureWeb"),
    "password": os.getenv("DB_PASSWORD", "admin"),
    "database": os.getenv("DB_NAME", "innovation")
}
