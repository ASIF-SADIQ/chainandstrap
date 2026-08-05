from gradio_client import Client, handle_file
import time

try:
    print("Connecting to ModelScope...")
    client = Client("https://wan-ai-wan2-2-animate.ms.show/")
    print("Connected! Sending dummy request...")
    
    job = client.submit(
        ref_img="https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
        video="https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/video_sample.mp4",
        model_id="wan2.2-animate-move",
        model="wan-pro",
        api_name="/predict"
    )
    
    print("Job submitted!")
    for i in range(5):
        print("Status:", job.status())
        time.sleep(2)
        
except Exception as e:
    print("ERROR:", e)
