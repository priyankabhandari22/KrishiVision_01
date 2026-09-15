"""
test_workflow_and_history.py
----------------------------
Integration test script verifying:
1. FastAPI app loading & route registration.
2. POST /predict image upload & pipeline execution.
3. GET /history retrieval of logged predictions.
4. GET /analytics calculation of KPIs and model benchmarks.
"""

import io
import sys
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def create_test_leaf_image(width=224, height=224, color=(34, 139, 34)):
    img = Image.new('RGB', (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

def run_tests():
    print("=== Testing /health Endpoint ===")
    res = client.get("/health")
    print(f"Health check status: {res.status_code}, body: {res.json()}")
    assert res.status_code == 200

    print("\n=== Testing POST /predict Pipeline ===")
    image_bytes = create_test_leaf_image()
    files = {"file": ("test_leaf.jpg", image_bytes, "image/jpeg")}
    res = client.post("/predict", files=files)
    print(f"Predict status: {res.status_code}")
    assert res.status_code == 200
    data = res.json()
    print(f"Crop: {data.get('crop')}, Disease: {data.get('disease')}, Status: {data.get('status')}")
    print(f"Confidence: {data.get('confidence')}, Is Confident: {data.get('is_confident')}")
    print(f"Heatmap Path: {data.get('heatmap_path')}")

    print("\n=== Testing GET /history Endpoint ===")
    res = client.get("/history")
    print(f"History status: {res.status_code}")
    assert res.status_code == 200
    history_data = res.json()
    print(f"Total history count: {history_data.get('count')}")
    assert history_data.get("count") > 0

    print("\n=== Testing GET /analytics Endpoint ===")
    res = client.get("/analytics")
    print(f"Analytics status: {res.status_code}")
    assert res.status_code == 200
    analytics = res.json()
    print(f"Total Predictions: {analytics.get('total_predictions')}")
    print(f"Healthy Count: {analytics.get('healthy_count')}")
    print(f"Diseased Count: {analytics.get('diseased_count')}")
    print(f"Average Confidence: {analytics.get('average_confidence')}")
    print(f"Model Benchmarks Selected: {analytics.get('model_benchmarks', {}).get('selected_model')}")

    print("\n✅ ALL BACKEND WORKFLOW & HISTORY TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
