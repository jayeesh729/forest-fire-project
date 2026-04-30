import torch
import sys
import os

# Mock the extra_modules so it loads at all
class Dummy(torch.nn.Module):
    def __init__(self, *args, **kwargs):
        super().__init__()
    def forward(self, x, *args, **kwargs):
        return x

class Mock(object):
    def __getattr__(self, name):
        return Dummy

sys.modules['ultralytics.nn.extra_modules'] = Mock()
sys.modules['ultralytics.nn.extra_modules.block'] = Mock()
sys.modules['ultralytics.nn.extra_modules.conv'] = Mock()

try:
    # Use torch.load to inspect the checkpoint
    ckpt = torch.load('model/best.pt', map_location='cpu', weights_only=False)
    
    print("--- Model Checkpoint Metadata ---")
    if isinstance(ckpt, dict):
        print(f"Keys in checkpoint: {list(ckpt.keys())}")
        
        # Check for metadata
        if 'epoch' in ckpt:
            print(f"Epoch: {ckpt['epoch']}")
        if 'best_fitness' in ckpt:
            print(f"Best Fitness: {ckpt['best_fitness']}")
            
        # Check for model info
        model = ckpt.get('model')
        if model:
            print(f"Model Type: {type(model).__name__}")
            if hasattr(model, 'names'):
                print(f"Class Names: {model.names}")
            if hasattr(model, 'task'):
                print(f"Task: {model.task}")
            if hasattr(model, 'yaml'):
                print(f"YAML Config: {ckpt.get('yaml', 'N/A')}")
    else:
        print(f"Loaded object is of type: {type(ckpt)}")

except Exception as e:
    print(f"Error inspecting model: {e}")
