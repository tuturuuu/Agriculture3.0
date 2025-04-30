from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ProductStatus(str, Enum):
    fresh = "Fresh"
    expired = "Expired"
class ProductCreate(BaseModel):
    name: str = Field(..., max_length=255)
    categoryId: Optional[int] = None
    harvestDate: Optional[datetime] = None
    expirationDate: Optional[datetime] = None
    currentStatus: ProductStatus = ProductStatus.fresh
    ownerAddress: str = Field(..., max_length=255)
    region: Optional[str] = Field(None, max_length=255)
    imageSrc: Optional[str] = Field(None, max_length=255)
    isForSale: bool = True
    quantity: int = Field(..., ge=0)
    price: str = Field(..., max_length=255)
    productId: int
    description: Optional[str] = Field(None, max_length=255)

class ProductResponse(BaseModel):
    id: int
    name: str
    harvestDate: Optional[datetime] = None
    expirationDate: Optional[datetime] = None
    currentStatus: str
    imageSrc: Optional[str] = None
    price: str
    categoryName: Optional[str] = None
    description: Optional[str] = None  # Added description field
    quantity: Optional[int] = None  
    ownerAddress: Optional[str] = None
    region: Optional[str] = None
    productId: int