from gradio_client import Client
try:
    print("Connecting to Hugging Face...")
    client = Client("Wan-AI/Wan2.2-Animate")
    print("Connected!")
except Exception as e:
    print("ERROR:", e)
