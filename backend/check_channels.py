import torch
import sys
import ultralytics.nn.modules

class MissingClassMeta(type):
    def __new__(cls, name, bases, dct):
        return super().__new__(cls, name, bases, dct)

def create_dynamic_class(name):
    class DynamicObj(torch.nn.Module):
        def forward(self, x, *args, **kwargs):
            return x
    DynamicObj.__name__ = name
    return DynamicObj

class MockExtraModules:
    def __init__(self, name):
        self.name = name
    def __getattr__(self, name):
        if name in ['HGBlock', 'HGStem']:
            return getattr(ultralytics.nn.modules.block, name)
        dyn_class = create_dynamic_class(name)
        setattr(sys.modules[self.name], name, dyn_class)
        return dyn_class
        
sys.modules['ultralytics.nn.extra_modules'] = MockExtraModules('ultralytics.nn.extra_modules')
sys.modules['ultralytics.nn.extra_modules.block'] = MockExtraModules('ultralytics.nn.extra_modules.block')
sys.modules['ultralytics.nn.extra_modules.conv'] = MockExtraModules('ultralytics.nn.extra_modules.conv')

m = torch.load('model/best.pt', map_location='cpu', weights_only=False)
model = m['model']

for i, layer in enumerate(model.model):
    if type(layer).__name__ in ['RGCSPELAN', 'FeaturePyramidSharedConv']:
        print(f"\n--- Layer {i}: {type(layer).__name__} ---")
        for key, val in layer._modules.items():
            if hasattr(val, 'in_channels'):
                print(f"{key}: in={val.in_channels}, out={val.out_channels}")
            elif hasattr(val, 'conv') and hasattr(val.conv, 'in_channels'):
                print(f"{key}: in={val.conv.in_channels}, out={val.conv.out_channels}")
            elif hasattr(val, 'conv1') and hasattr(val.conv1, 'conv') and hasattr(val.conv1.conv, 'in_channels'):
                print(f"{key}: in={val.conv1.conv.in_channels}, out={val.conv1.conv.out_channels}")
            else:
                 print(f"{key}: {type(val).__name__} with submodules: {[k for k in val._modules.keys()]}")
