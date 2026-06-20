import os
import time
import requests
from dotenv import load_dotenv

# Load environment variables (Make sure to create a .env file with these credentials)
load_dotenv()

# Appwrite Credentials
APPWRITE_ENDPOINT = os.getenv("NEXT_PUBLIC_APPWRITE_ENDPOINT")
APPWRITE_PROJECT = os.getenv("NEXT_PUBLIC_APPWRITE_PROJECT")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY") # You need a server API key
DB_ID = os.getenv("NEXT_PUBLIC_DB_ID", "luxury_db")
COL_ID = os.getenv("NEXT_PUBLIC_COL_ID", "products")

# Pinterest API Credentials
PINTEREST_ACCESS_TOKEN = os.getenv("PINTEREST_ACCESS_TOKEN")
PINTEREST_BOARD_ID = os.getenv("PINTEREST_BOARD_ID")

def fetch_unpinned_products():
    """Fetch products from Appwrite that haven't been pinned to Pinterest yet."""
    headers = {
        "X-Appwrite-Project": APPWRITE_PROJECT,
        "X-Appwrite-Key": APPWRITE_API_KEY,
        "Content-Type": "application/json"
    }
    
    url = f"{APPWRITE_ENDPOINT}/databases/{DB_ID}/collections/{COL_ID}/documents"
    
    # In a real scenario, you'd add a query to filter products where `pinned == false`
    # payload = {"queries": ['equal("pinned", false)', 'limit(5)']}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json().get('documents', [])
        else:
            print(f"Error fetching products: {response.text}")
            return []
    except Exception as e:
        print(f"Connection error: {e}")
        return []

def pin_to_pinterest(product):
    """Create a Pin on Pinterest for a specific product."""
    url = "https://api.pinterest.com/v5/pins"
    
    headers = {
        "Authorization": f"Bearer {PINTEREST_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Parse the first image from the product's image JSON array
    # Adjust this based on your actual data structure
    import json
    try:
        images = json.loads(product.get('images', '[]'))
        main_image = images[0] if images else ""
    except:
        main_image = ""

    if not main_image:
        print(f"Skipping {product.get('title')} - No image found")
        return False

    product_url = f"https://chainandstrap.store/product/{product.get('handle')}"
    
    payload = {
        "board_id": PINTEREST_BOARD_ID,
        "media_source": {
            "source_type": "image_url",
            "url": main_image
        },
        "link": product_url,
        "title": f"{product.get('vendor', '')} {product.get('title', '')} | Chain & Straps",
        "description": product.get('seo_desc', product.get('title', ''))
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        print(f"Successfully Pinned: {product.get('title')}")
        return True
    else:
        print(f"Failed to Pin {product.get('title')}: {response.text}")
        return False

def main():
    print("Starting Chain & Straps Pinterest Automation...")
    products = fetch_unpinned_products()
    
    if not products:
        print("No new products to pin.")
        return

    for product in products:
        success = pin_to_pinterest(product)
        if success:
            # Here you would typically make an API call back to Appwrite 
            # to update the product's `pinned` status to True
            pass
            
        # Sleep to avoid hitting Pinterest API rate limits
        print("Waiting 15 seconds before next pin...")
        time.sleep(15)

if __name__ == "__main__":
    main()
