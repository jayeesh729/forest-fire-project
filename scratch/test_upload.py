import requests
import base64

url = 'http://127.0.0.1:5000/predict'
files = {'file': open('backend/test.jpg', 'rb')}

try:
    response = requests.post(url, files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
