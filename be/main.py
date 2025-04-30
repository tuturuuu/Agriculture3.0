from fastapi import FastAPI
from api.routes import products, images, categories, users, cart, transactions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS settings
origins = ["http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# Include API routes
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(images.router, prefix="/images", tags=["Images"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
@app.get("/")
def root():
    return {"message": "Welcome to the Coffee Marketplace API"}

