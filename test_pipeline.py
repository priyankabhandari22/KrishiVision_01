import io
import backend
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.user_service import delete_user

client = TestClient(app)

TEST_EMAIL = "pipeline.test@example.com"
TEST_PASSWORD = "password123"

def make_test_image(width=100, height=100, color=(0, 128, 0)):
    img = Image.new('RGB', (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

delete_user(TEST_EMAIL)
client.post('/auth/register', json={
    "name": "Pipeline Test",
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "confirm_password": TEST_PASSWORD,
})
resp = client.post('/predict', files={'file': ('leaf_test.jpg', make_test_image(224, 224), 'image/jpeg')})
print('Status:', resp.status_code)
if resp.status_code == 503:
    print('Prediction failed as expected due to missing model.')
else:
    print(resp.json())
delete_user(TEST_EMAIL)
