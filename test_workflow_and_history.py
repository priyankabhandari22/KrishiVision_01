"""
test_workflow_and_history.py
----------------------------
Integration test script verifying:
1. FastAPI app loading & route registration.
2. POST /predict image upload & pipeline execution (authenticated).
3. GET /history retrieval of logged predictions (authenticated + per-user).
4. GET /history/{id} ownership enforcement (404 cross-user).
5. DELETE /history scoped to the current user only.
6. GET /analytics calculation of KPIs and benchmarks (per-user).
"""

import io
import sys
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.user_service import delete_user

client = TestClient(app)

TEST_EMAIL_A = "workflow.a@example.com"
TEST_EMAIL_B = "workflow.b@example.com"
TEST_PASSWORD = "password123"


def register_and_login(name, email, password):
    print(f"--- Registering and logging in {email} ---")
    delete_user(email)
    c = TestClient(app)
    res = c.post("/auth/register", json={
        "name": name,
        "email": email,
        "password": password,
        "confirm_password": password,
    })
    print(f"Register status: {res.status_code}")
    assert res.status_code == 201
    res = c.post("/auth/login", json={"email": email, "password": password})
    print(f"Login status: {res.status_code}")
    assert res.status_code == 200
    me = c.get("/auth/me")
    print(f"Session check /auth/me: {me.status_code}, user: {me.json().get('user', {}).get('email')}")
    assert me.status_code == 200
    return c, me.json()["user"]


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

    client_a, user_a = register_and_login("Workflow A", TEST_EMAIL_A, TEST_PASSWORD)
    print(f"User A id: {user_a.get('id')}")

    print("\n=== Testing Unauthenticated Access Is Blocked ===")
    unauth_client = TestClient(app)
    assert unauth_client.get("/history").status_code == 401
    assert unauth_client.get("/analytics").status_code == 401
    assert unauth_client.get("/history/anything").status_code == 401
    assert unauth_client.delete("/history").status_code == 401
    print("Unauthenticated history/analytics endpoints correctly return 401.")

    print("\n=== Testing POST /predict Pipeline (User A) ===")
    image_bytes = create_test_leaf_image()
    files = {"file": ("test_leaf.jpg", image_bytes, "image/jpeg")}
    res = client_a.post("/predict", files=files)
    print(f"Predict status: {res.status_code}")
    assert res.status_code == 200
    data = res.json()
    print(f"Crop: {data.get('crop')}, Disease: {data.get('disease')}, Status: {data.get('status')}")
    print(f"Confidence: {data.get('confidence')}, Is Confident: {data.get('is_confident')}")

    print("\n=== Testing GET /history (User A) ===")
    res = client_a.get("/history")
    print(f"History status: {res.status_code}")
    assert res.status_code == 200
    history_data = res.json()
    print(f"Total history count: {history_data.get('count')}")
    assert history_data.get("count") > 0
    assert all(item.get("user_id") == user_a.get("id") for item in history_data.get("history", []))
    print("Every returned record belongs to User A.")
    record_a_id = history_data["history"][0]["id"]

    print("\n=== Testing GET /history/{id} Ownership (User A) ===")
    res = client_a.get(f"/history/{record_a_id}")
    print(f"User A fetches own record: {res.status_code}")
    assert res.status_code == 200

    print("\n=== Testing GET /analytics (User A) ===")
    res = client_a.get("/analytics")
    print(f"Analytics status: {res.status_code}")
    assert res.status_code == 200
    analytics = res.json()
    print(f"Total Predictions: {analytics.get('total_predictions')}")
    assert analytics.get("total_predictions") > 0
    assert analytics.get("last_scan_confidence") is not None
    print(f"Last scan confidence: {analytics.get('last_scan_confidence')}")
    print(f"Model Benchmarks Selected: {analytics.get('model_benchmarks', {}).get('selected_model')}")

    print("\n=== Testing Per-User Isolation With User B ===")
    client_b, user_b = register_and_login("Workflow B", TEST_EMAIL_B, TEST_PASSWORD)
    print(f"User B id: {user_b.get('id')}")

    res = client_b.get("/history")
    print(f"User B history count (expected 0): {res.json().get('count')}")
    assert res.status_code == 200
    assert res.json().get("count") == 0

    res = client_b.get(f"/history/{record_a_id}")
    print(f"User B fetches User A's record (expected 404): {res.status_code}")
    assert res.status_code == 404

    res = client_b.get("/analytics")
    print(f"User B analytics total (expected 0): {res.json().get('total_predictions')}")
    assert res.status_code == 200
    assert res.json().get("total_predictions") == 0
    assert res.json().get("last_scan_confidence") is None

    res = client_b.delete("/history")
    print(f"User B DELETE /history -> {res.status_code}, cleared_count: {res.json().get('cleared_count')}")
    assert res.status_code == 200
    assert res.json().get("cleared_count") == 0

    res = client_a.get(f"/history/{record_a_id}")
    print(f"User A's record still intact for User A (expected 200): {res.status_code}")
    assert res.status_code == 200

    print("\n=== Testing POST /auth/logout ===")
    res = client_a.post("/auth/logout")
    print(f"Logout status: {res.status_code}")
    assert res.status_code == 200
    res = client_a.get("/auth/me")
    print(f"Session after logout (expected 401): {res.status_code}")
    assert res.status_code == 401

    delete_user(TEST_EMAIL_A)
    delete_user(TEST_EMAIL_B)
    print("Cleaned up test users.")

    print("\nALL BACKEND WORKFLOW & HISTORY TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()