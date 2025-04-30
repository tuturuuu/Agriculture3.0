from typing import List
from fastapi import APIRouter, HTTPException, Depends
from db.connection import get_connection
from utils.auth import verify_token

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_cart_products(wallet_address: str = Depends(verify_token)):
    """Fetch shopping cart items with only essential product details."""
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT sc.cartId AS id,
            p.productId,
            p.name, 
            p.price, 
            p.imageSrc AS image, 
            p.ownerAddress AS creator 
        FROM shoppingCart sc
        JOIN products p ON sc.productId = p.id
        JOIN users u ON u.userId = sc.userId
        WHERE u.walletAddress = %s
        ORDER BY sc.addedAt DESC
    """, (wallet_address,))
    cart_items = cursor.fetchall()
    cursor.close()
    conn.close()

    if not cart_items:
        raise HTTPException(status_code=404, detail="No products found in the cart")
    
    return cart_items