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
    m = torch.load('model/best.pt', map_location='cpu', weights_only=False)
    # The 'model' key usually contains the model object.
    # In some ultralytics versions, it's m['model'] or m.get('model')
    model = m.get('model') if isinstance(m, dict) else m
    
    # Access the actual torch.nn.Module
    if hasattr(model, 'model'):
        model_module = model.model
    else:
        model_module = model

    # Check the first layer
    first_layer = None
    for name, module in model_module.named_modules():
        if isinstance(module, (torch.nn.Conv2d, torch.nn.Conv1d)):
            first_layer = module
            break
            
    if first_layer:
        print(f"FIRST CONV: in={first_layer.in_channels}, out={first_layer.out_channels}, kernel={first_layer.kernel_size}")
    else:
        print("Could not find any Conv2d in the model")
        
except Exception as e:
    print(f"Error checking: {e}")
