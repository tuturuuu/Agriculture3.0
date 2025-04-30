from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from db.connection import get_connection
from utils.auth import verify_token
from pydantic import BaseModel

router = APIRouter()

# Pydantic model for transaction response
class Transaction(BaseModel):
    transactionId: int
    productId: int
    buyerId: int
    sellerId: int
    destination: str
    quantity: int
    timestamp: datetime
    productName: Optional[str] = None


# Get user's own transactions
@router.get("/user/me", response_model=List[Transaction])
def get_my_transactions(
    wallet_address: str = Depends(verify_token),
):
    print(wallet_address)
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get user ID from wallet address
        cursor.execute("SELECT userId FROM users WHERE walletAddress = %s", (wallet_address,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = user["userId"]
        
        # Get user's transactions with product details
        cursor.execute("""
            SELECT 
                t.transactionId, t.productId, t.buyerId, t.sellerId, t.destination, 
                t.quantity, t.timestamp, 
                p.name as productName
            FROM transactions t
            LEFT JOIN products p ON t.productId = p.productId
            WHERE t.buyerId = %s or t.sellerId = %s
            ORDER BY t.timestamp DESC
        """, (user_id, user_id, ))
        
        transactions = cursor.fetchall()
        print(transactions)
        return transactions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve transactions: {str(e)}")
    finally:
        cursor.close()
        conn.close()
