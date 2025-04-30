from datetime import datetime
from typing import List
from fastapi import APIRouter, Body, HTTPException, Depends
from db.connection import get_connection
from schemas.product import ProductCreate, ProductResponse
from web3 import Web3
import json
from dotenv import load_dotenv
import os
from utils.auth import verify_token

load_dotenv()

router = APIRouter()
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  

PRODUCT_ADDRESS = Web3.to_checksum_address(os.getenv("AGRI_TRADE_ADDRESS"))

# Extract only the ABI
with open('../dapp/artifacts/contracts/AgriTrade.sol/AgriTrade.json', 'r') as file:
    contract_data = json.load(file)  
    abi = contract_data.get("abi")  

product_contract = w3.eth.contract(address=PRODUCT_ADDRESS, abi=abi)


@router.post("/", response_model=dict)
def create_product(product: ProductCreate, wallet_address: str = Depends(verify_token)):
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    print(product)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO products (name, categoryId, harvestDate, expirationDate, currentStatus, ownerAddress, 
                               region, imageSrc, quantity, price, isForSale, productId, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (product.name, product.categoryId, product.harvestDate, product.expirationDate, product.currentStatus, product.ownerAddress, 
          product.region, product.imageSrc, product.quantity, product.price, product.isForSale, product.productId, product.description))
    conn.commit()
    product_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"message": "Product created", "productId": product_id}


@router.get("/", response_model=List[ProductResponse])
def get_products():
    """Fetch product statistics from the database."""
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, productId, products.name, harvestDate, expirationDate, currentStatus, imageSrc, price, category.name as categoryName FROM products INNER JOIN category ON products.categoryId = category.categoryId where isForSale = 1 ORDER by productId DESC;")
    products = cursor.fetchall()
    for product in products:
        product["price"] = str(product["price"])
    cursor.close()
    conn.close()

    if not products:
        raise HTTPException(status_code=404, detail="No products found")
    
    get_product_metadata()

    return products

@router.get("/limit/{limit}", response_model=List[ProductResponse])
def get_limited_products(limit: int):
    """Fetch product statistics from the database."""
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, productId, products.name, harvestDate, expirationDate, currentStatus, imageSrc, price, category.name as categoryName, description FROM products INNER JOIN category ON products.categoryId = category.categoryId where isForSale = 1 ORDER by productId DESC LIMIT %s;", (limit,))
    products = cursor.fetchall()
    for product in products:
        product["price"] = str(product["price"])
    cursor.close()
    conn.close()

    if not products:
        raise HTTPException(status_code=404, detail="No products found")
    
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, products.productId, products.name, harvestDate, expirationDate, currentStatus, imageSrc, price, category.name as categoryName, 
        ownerAddress, region, description, quantity 
        FROM products 
        INNER JOIN category ON products.categoryId = category.categoryId 
        WHERE products.productId = %s
    """, (product_id,))
    product = cursor.fetchone()
    product["price"] = str(product["price"])
    print(product["price"])
    cursor.close()
    conn.close()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product



@router.post("/buy/{product_id}", response_model=dict)
def buy_product(
    product_id: int,
    quantity: int = Body(..., embed=True),
    destination: str = Body(..., embed=True),
    wallet_address: str = Depends(verify_token),
    owner_address: str = Body(..., embed=True),
):
    # Database connection
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)

    try:
        # Start transaction by turning off autocommit
        conn.autocommit = False
        
        # Fetch product details
        cursor.execute("SELECT * FROM products WHERE productId = %s", (product_id,))
        product = cursor.fetchone()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if not product["isForSale"]:
            raise HTTPException(status_code=400, detail="Product is not for sale")
            
        # Check if there's enough quantity available
        if product["quantity"] < quantity:
            raise HTTPException(status_code=400, detail="Insufficient quantity available")
        
        # Get user ID from wallet address
        cursor.execute("SELECT userId FROM users WHERE walletAddress = %s", (wallet_address,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_id = user["userId"]

                # Get user ID from wallet address
        cursor.execute("SELECT userId FROM users WHERE walletAddress = %s", (owner_address,))
        seller = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        seller_id = seller["userId"]
        
        # Calculate new quantity
        new_quantity = product["quantity"] - quantity
        
        # Update product quantity and set isForSale to FALSE if quantity becomes 0
        if new_quantity == 0:
            cursor.execute("""
                UPDATE products 
                SET quantity = %s, isForSale = FALSE 
                WHERE productId = %s
            """, (new_quantity, product_id))
        else:
            cursor.execute("""
                UPDATE products 
                SET quantity = %s
                WHERE productId = %s
            """, (new_quantity, product_id))
        print(owner_address)
        # Record the transaction with user-provided destination
        cursor.execute("""
            INSERT INTO transactions (productId, buyerId, sellerId, destination, quantity, timestamp)
            VALUES (%s, %s, %s,%s, %s, NOW())
        """, (product_id, user_id, seller_id, destination, quantity))
        
        # Commit the transaction
        conn.commit()
        
        return {
            "message": "Product purchased successfully", 
            "quantityPurchased": quantity,
            "remainingQuantity": new_quantity,
            "destination": destination,
            "transactionRecorded": True
        }
            
    except Exception as e:
        # Rollback in case of error
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")
    finally:
        # Restore autocommit mode if needed
        if conn and conn.is_connected():
            conn.autocommit = True
            cursor.close()
            conn.close()

def get_product_metadata():
    try:
        user_address = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"
        transactions = product_contract.functions.txCounter().call()
        print(transactions)

    except Exception as e:
        return {"error": str(e)}




