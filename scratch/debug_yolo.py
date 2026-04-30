import os
import cv2
import torch
import sys
from ultralytics import YOLO

# Setup mapping
import ultralytics.nn.modules
sys.modules['ultralytics.nn.extra_modules'] = ultralytics.nn.modules

MODEL_PATH = 'backend/model/best.pt'
yolo_model = YOLO(MODEL_PATH)

image = cv2.imread('backend/test.jpg')
device = 'cuda' if torch.cuda.is_available() else 'cpu'

print(f"Device: {device}")
print(f"Image shape: {image.shape}")

# Pre-resize as in app.py
target_size = 640
h, w = image.shape[:2]
scale = target_size / max(h, w)
image = cv2.resize(image, (int(w * scale), int(h * scale)))

print(f"Resized shape: {image.shape}")

try:
    print("Running inference...")
    results = yolo_model(image, device=device, conf=0.25, imgsz=target_size, verbose=True)
    print("Inference done!")
    print(f"Detections: {len(results[0].boxes)}")
except Exception as e:
    print(f"Error: {e}")
