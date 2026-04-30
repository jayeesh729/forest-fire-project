import sys
import os

print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")
print(f"Current Working Directory: {os.getcwd()}")

try:
    import flask
    print(f"Flask: {flask.__version__}")
except ImportError:
    print("Flask: NOT INSTALLED")

try:
    import torch
    print(f"Torch: {torch.__version__}")
except ImportError:
    print("Torch: NOT INSTALLED")

try:
    import ultralytics
    print(f"Ultralytics: {ultralytics.__version__}")
except ImportError:
    print("Ultralytics: NOT INSTALLED")
