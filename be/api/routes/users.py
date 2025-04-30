import os
import time
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from db.connection import get_connection
from schemas.product import ProductCreate, ProductResponse
import random
import jwt
from web3 import Web3
from eth_account.messages import encode_defunct
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY")

w3 = Web3(Web3.HTTPProvider("https://127.0.0.1:8545"))  
from pydantic import BaseModel
class VerifySignatureRequest(BaseModel):
    wallet_address: str
    signature: str

# Generate a random nonce
def generate_nonce():
    return str(random.randint(100000, 999999))


@router.get("/auth/nonce/{wallet_address}")
def get_nonce(wallet_address: str):
    """Generate a nonce and store it in MySQL for the user."""
    wallet_address = wallet_address.lower()

    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()

    # Check if user exists
    cursor.execute("SELECT nonce FROM users WHERE walletAddress = %s", (wallet_address,))
    user = cursor.fetchone()
    if user:
        nonce = user[0]  # Use existing nonce
    else:
        nonce = generate_nonce()
        cursor.execute("INSERT INTO users (walletAddress, nonce) VALUES (%s, %s)", (wallet_address, nonce))
        conn.commit()

    cursor.close()
    conn.close()

    return {"nonce": nonce}


@router.post("/auth/verify")
def verify_signature(request: VerifySignatureRequest):
    wallet_address = request.wallet_address.lower()
    signature = request.signature

    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()

    # Fetch nonce from MySQL
    cursor.execute("SELECT nonce FROM users WHERE walletAddress = %s", (wallet_address,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=400, detail="Nonce not found")

    nonce = user[0]
    message = f"Sign this message to authenticate: {nonce}"

    # Properly encode message using `encode_defunct`
    encoded_message = encode_defunct(text=message)

    try:
        # Recover signer address 
        recovered_address = w3.eth.account.recover_message(encoded_message, signature=signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {str(e)}")

    if recovered_address.lower() != wallet_address:
        raise HTTPException(status_code=401, detail="Signature verification failed")

    # Generate JWT token
    token = jwt.encode({"wallet": wallet_address, "exp": time.time() + 3600}, SECRET_KEY, algorithm="HS256")

    # Reset nonce for security (prevent replay attacks)
    new_nonce = generate_nonce()
    cursor.execute("UPDATE users SET nonce = %s WHERE walletAddress = %s", (new_nonce, wallet_address))
    
    cursor.close()
    conn.close()

    return {"token": token}