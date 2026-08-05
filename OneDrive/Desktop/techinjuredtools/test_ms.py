from gradio_client import Client
import traceback
try:
    print("Testing ModelScope URL...")
    client = Client("https://www.modelscope.cn/studios/Wan-AI/Wan2.2-Animate")
    print("SUCCESS: Config fetched!")
except Exception as e:
    print("ERROR:")
    traceback.print_exc()
