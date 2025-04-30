from typing import List
from fastapi import APIRouter, HTTPException, Depends
from db.connection import get_connection
from schemas.product import ProductCreate

router = APIRouter()

# ============= Category API =============
@router.get("/", response_model=List[str])
def get_categories():
    """Fetch all coffee categories from the database."""
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = conn.cursor()
    cursor.execute("SELECT name FROM category;")
    categories = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()

    if not categories:
        raise HTTPException(status_code=404, detail="No categories found")

    return categories
