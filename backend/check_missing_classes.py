import torch
import sys
import ultralytics.nn.modules
import ultralytics.nn.modules.block as block_module

original_getattr = getattr(block_module, '__getattr__')
def my_getattr(name):
    print(f"Missing custom class in block.py: {name}")
    return block_module.DummyModule

block_module.__getattr__ = my_getattr
sys.modules['ultralytics.nn.extra_modules'] = ultralytics.nn.modules

m = torch.load('model/best.pt', map_location='cpu', weights_only=False)
model = m['model']

for i, layer in enumerate(model.model):
    print(f"{i}: {type(layer).__name__}")
