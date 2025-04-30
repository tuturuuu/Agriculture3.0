from fastapi import APIRouter
from db.connection import get_connection
import os
import shutil
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
router = APIRouter()

# Directory for uploaded images
UPLOAD_FOLDER = "./data/coffee-pictures"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

IMAGE_FOLDER = "./data/category-pictures"
os.makedirs(IMAGE_FOLDER, exist_ok=True)

# Serve the uploads directory as static files
router.mount("/data/coffee-pictures", StaticFiles(directory=UPLOAD_FOLDER), name="coffee-pictures")

@router.post("/coffee-pictures/")
async def upload_file(file: UploadFile = File(...)):
    """Upload an image and save it to the uploads directory."""
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": file.filename, "path": f"/data/coffee-pictures/{file.filename}"}

@router.get("/coffee-pictures/{filename}")
async def get_image(filename: str):
    """Serve an uploaded image by filename."""
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    return FileResponse(file_path)

@router.get("/categories-pictures/")
def list_category_pictures():
    """Returns a list of image URLs from the 'category-pictures' folder"""
    
    if not os.path.exists(IMAGE_FOLDER):
        return {"error": "Category pictures folder not found"}

    images = [
        f"http://127.0.0.1:8000/images/categories-pictures/{file}" 
        for file in os.listdir(IMAGE_FOLDER)
        if file.lower().endswith((".png", ".jpg", ".jpeg", ".gif"))
    ]
    
    return {"images": images}

@router.get("/categories-pictures/{filename}")
async def get_image(filename: str):
    """Serve an uploaded image by filename."""
    file_path = os.path.join(IMAGE_FOLDER, filename)
    
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    return FileResponse(file_path)