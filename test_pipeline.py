import io
import backend
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def make_test_image(width=100, height=100, color=(0, 128, 0)):
    img = Image.new('RGB', (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

valid_img_bytes = make_test_image(224, 224)
files = {'file': ('leaf_test.jpg', valid_img_bytes, 'image/jpeg')}
resp = client.post('/predict', files=files)
print('Status:', resp.status_code)
if resp.status_code == 503:
    print('Prediction failed as expected due to missing model.')
else:
    print(resp.json())
