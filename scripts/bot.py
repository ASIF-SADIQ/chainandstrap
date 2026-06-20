import requests
import time
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

# 1. Configuration (Appwrite & Pinterest)
APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1'
APPWRITE_PROJECT = 'your_project_id'
APPWRITE_KEY = 'your_api_key'
DB_ID = 'luxury_db'
COL_ID = 'products'

PINTEREST_ACCESS_TOKEN = 'your_pinterest_access_token'
PINTEREST_BOARD_ID = 'your_board_id'
WEBSITE_URL = 'https://chainandstraps.me/product/'

# 2. Initialize Appwrite
client = Client().set_endpoint(APPWRITE_ENDPOINT).set_project(APPWRITE_PROJECT).set_key(APPWRITE_KEY)
databases = Databases(client)

def create_pinterest_pin(title, description, link, image_url):
    url = "https://api.pinterest.com/v5/pins"
    headers = {
        "Authorization": f"Bearer {PINTEREST_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "title": title,
        "description": description,
        "link": link,
        "media_source": {
            "source_type": "image_url",
            "url": image_url
        },
        "board_id": PINTEREST_BOARD_ID
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

def start_sync():
    print("🚀 Chain & Straps Automation Started...")
    
    # Fetch products that haven't been pinned yet
    # (Humein Appwrite mein ek boolean 'pinned' field add karni hogi)
    result = databases.list_documents(DB_ID, COL_ID, [
        Query.equal('published', True),
        Query.limit(10) # Ek waqt mein 10 pins taake Pinterest ban na kare
    ])

    for product in result['documents']:
        product_link = f"{WEBSITE_URL}{product['handle']}"
        images = eval(product['images']) # Convert string back to list
        
        print(f"📌 Pinning: {product['title']}")
        
        response = create_pinterest_pin(
            title=product['title'],
            description=f"Mirror Quality Premium {product['vendor']} bag. Shop now at Chain & Straps.",
            link=product_link,
            image_url=images[0]
        )
        
        if 'id' in response:
            print(f"✅ Success! Pin ID: {response['id']}")
            # Update product so we don't pin it again
            databases.update_document(DB_ID, COL_ID, product['$id'], {"pinned": True})
        else:
            print(f"❌ Error: {response}")
        
        time.sleep(30) # 30 seconds gap between pins to stay safe

if __name__ == "__main__":
    start_sync()
