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

class ForwardShapePrinter:
    def __init__(self, model):
        self.model = model
    def run(self, x):
        y = []
        for i, m in enumerate(self.model.model):
            f = getattr(m, 'f', -1)
            if f != -1:
                if isinstance(f, int):
                    feed = y[f]
                else:
                    feed = [x if j == -1 else y[j] for j in f]
            else:
                feed = x
                
            try:
                # Dummy module returns feed directly.
                x = m(feed)
            except Exception as e:
                # Because dummy module fails on list, or we can just print error
                pass
            
            if isinstance(x, list):
                s = [str(item.shape) for item in x]
            else:
                s = str(x.shape)
            print(f"L{i} {type(m).__name__} Output shape: {s}")
            y.append(x)
            
# Wait, the DummyModule returns the input unmodified. If L13 is DummyModule, it returns 512 channels, not the correct channels. So subsequent layers fail!
