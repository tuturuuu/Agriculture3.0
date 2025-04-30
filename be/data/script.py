import os
import requests
import time

# Unsplash API details
UNSPLASH_API_URL = "https://api.unsplash.com/photos/random"
QUERY = "coffee"
ORIENTATION = "landscape"
CLIENT_ID = "ERBNjwcjs3PjKd2nORBgrJYTSfBu243eRKuLwhTmO48"  # Replace with your API key
IMAGES_TO_FETCH = 1000  # Total number of images desired
IMAGES_PER_REQUEST = 30  # Max images per request (Unsplash limit)

# Folder setup
folder_path = os.path.join(os.path.dirname(__file__), "coffee-pictures")
os.makedirs(folder_path, exist_ok=True)

# Track downloaded images to avoid duplicates
downloaded_urls = set()
image_count = 0

while image_count < IMAGES_TO_FETCH:
    remaining = IMAGES_TO_FETCH - image_count
    count = min(IMAGES_PER_REQUEST, remaining)  # Get remaining images

    # API request
    response = requests.get(
        UNSPLASH_API_URL,
        params={"query": QUERY, "orientation": ORIENTATION, "count": count, "client_id": CLIENT_ID},
    )

    if response.status_code != 200:
        print(f"Error fetching images: {response.status_code}")
        break  # Exit loop if request fails

    data = response.json()
    
    for item in data:
        image_url = item["urls"]["regular"]
        if image_url in downloaded_urls:
            continue  # Skip duplicates
        
        downloaded_urls.add(image_url)
        image_count += 1

        file_name = f"coffee-{image_count}.jpg"
        file_path = os.path.join(folder_path, file_name)

        # Download image
        img_response = requests.get(image_url, stream=True)
        with open(file_path, "wb") as file:
            for chunk in img_response.iter_content(1024):
                file.write(chunk)

        print(f"Downloaded {file_name}")

    # Avoid hitting API rate limits
    time.sleep(1)

print(f"\nSaved {image_count} images to {folder_path}")
