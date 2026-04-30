import torch
import sys
import ultralytics.nn.modules

# We will intercept missing classes and create dynamic classes for them so we can see their structure!
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
    if type(layer).__name__ in ['RGCSPELAN', 'FeaturePyramidSharedConv', 'FeaturePyramidSharedConv_v2', 'Ghost_HGBlock', 'DummyModule']:
        print(f"\n--- LAYER {i} : {type(layer).__name__} ---")
        for sub_name, sub_module in layer.named_modules():
            print(f"  {sub_name}: {type(sub_module).__name__}")
