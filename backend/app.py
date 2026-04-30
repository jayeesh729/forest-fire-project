import os
import cv2
import numpy as np
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

import torch
# PyTorch 2.6+ backwards compatibility override for trusted local weights
_original_load = torch.load
def _custom_load(*args, **kwargs):
    kwargs['weights_only'] = False
    return _original_load(*args, **kwargs)
torch.load = _custom_load


app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Load YOLO model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'best.pt')
yolo_model = None

try:
    import sys
    from ultralytics import YOLO
    
    # The user's specific YOLO-MP model was pickled expecting a module named "extra_modules"
    # The authors later renamed this to "modules" inside "ultralytics/nn/"
    # By mapping the old name to the new name in sys.modules, torch.load will unpickle it flawlessly!
    import ultralytics.nn.modules
    sys.modules['ultralytics.nn.extra_modules'] = ultralytics.nn.modules
    
except ImportError as e:
    app.logger.error(f"Failed to import ultralytics: {e}")

try:
    if 'YOLO' in locals() and os.path.exists(MODEL_PATH):
        # Setting map_location='cpu' can sometimes help with deployment environments if cuda isn't perfectly matched, but we'll stick to default
        yolo_model = YOLO(MODEL_PATH)
        app.logger.info(f"YOLO Model loaded successfully from {MODEL_PATH}")
    elif not os.path.exists(MODEL_PATH):
        app.logger.warning(f"YOLO Model NOT FOUND at {MODEL_PATH}. Prediction will return errors until model is provided.")
except Exception as e:
    app.logger.error(f"Error loading custom YOLO model ({MODEL_PATH}):\n{e}\nEnsure your model doesn't require a custom fork of ultralytics.")

@app.route('/', methods=['GET'])
def index():
    return "Backend running"

@app.route('/predict', methods=['POST'])
def predict():
    # Handle both multipart/form-data (file upload) and JSON (base64 for live feed)
    image = None
    
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            file_bytes = np.frombuffer(file.read(), np.uint8)
            image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if image is None and request.is_json:
        data = request.get_json()
        if 'image' in data and data['image']:
            try:
                # Remove header if present (e.g., data:image/jpeg;base64,)
                encoded_data = data['image'].split(',')[-1]
                if not encoded_data:
                     app.logger.warning("Received empty image string")
                else:
                    decoded = base64.b64decode(encoded_data)
                    if decoded:
                        nparr = np.frombuffer(decoded, np.uint8)
                        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    else:
                        app.logger.warning("Base64 decode returned empty data")
            except Exception as decode_err:
                app.logger.error(f"Base64 decoding failed: {decode_err}")

    if image is None:
        return jsonify({"error": "No valid image data provided"}), 400

    if not yolo_model:
        return jsonify({"error": f"Model not loaded. Please ensure '{MODEL_PATH}' exists and restart the backend."}), 500
    
    try:
        # Check if we should skip image processing (for live feed speed)
        minify = False
        if request.is_json:
            try:
                data = request.get_json(silent=True)
                if data:
                    minify = data.get('minify', False)
            except Exception:
                pass

        # Save original dimensions for coordinate scaling
        orig_h, orig_w = image.shape[:2]
        
        # Resize image for much faster inference
        target_size = 640
        scale = 1.0
        if max(orig_h, orig_w) > target_size:
            scale = target_size / max(orig_h, orig_w)
            image = cv2.resize(image, (int(orig_w * scale), int(orig_h * scale)))

        # Auto-detect CUDA for GPU acceleration
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Run inference
        # We'll use more conservative arguments to ensure compatibility with custom models
        results = yolo_model(image, device=device, conf=0.25)
        
        detections = []
        if results and len(results) > 0:
            r = results[0]
            
            for box in r.boxes:
                # get coordinates on the resized image
                x1, y1, x2, y2 = map(float, box.xyxy[0])
                
                # Scale coordinates BACK to match the original resolution sent by the browser
                x1, y1, x2, y2 = x1 / scale, y1 / scale, x2 / scale, y2 / scale
                
                confidence = float(box.conf[0])
                cls_idx = int(box.cls[0])
                class_name = yolo_model.names[cls_idx] if hasattr(yolo_model, 'names') else str(cls_idx)
                
                detections.append({
                    "label": class_name,
                    "confidence": confidence,
                    "box": [int(x1), int(y1), int(x2), int(y2)]
                })
            
            if not minify:
                # Re-draw on the original image if we're returning the image (for upload mode)
                image = r.plot() 
                
        # Encode processed image to base64 ONLY if not minified
        image_base64 = None
        if not minify:
            _, buffer = cv2.imencode('.jpg', image)
            image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            "image": image_base64,
            "detections": detections
        }), 200
        
    except Exception as e:
        import traceback
        app.logger.error(f"Prediction Error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"error": f"Inference failed: {str(e)}"}), 500

if __name__ == '__main__':
    # Disabling reloader because it's triggering on unrelated system package changes
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
