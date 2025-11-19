import pytest
from fastapi.testclient import TestClient
# Assuming app is correctly imported from main and get_db from app.routers.order
from main import app 
from app.routers.order import get_db 
from supabase import AsyncClient 

# --- 1. MOCK: Supabase Client (ASYNC FIX) ---

class MockSupabaseClient:
    """Mocks the Supabase AsyncClient methods needed for testing."""
    
    def table(self, table_name: str):
        return self

    def insert(self, data: dict):
        self._insert_data = data
        return self

    # 🔥 FIX 1: execute() MUST be an async method to match repository usage 🔥
    async def execute(self): 
        """Mocks the final execution step to return a successful 201 response."""
        
        # Calculate total price, just like the repository *should* do, 
        # but safely accessing the mock input data to prevent NoneType errors.
        quantity = self._insert_data.get("Quantity", 0)
        unit_price = self._insert_data.get("unit price", 0)
        
        # Simulate the object structure returned by Supabase
        class MockResponse:
            data = [
                {
                    "order_id": "b3e0455d-7c8d-4f0e-9b3a-5c6d7e8f9a1b",
                    "user_id": self._insert_data.get("user_id"),
                    "vendor_id": self._insert_data.get("vendor_id"),
                    "menu": self._insert_data.get("menu"),
                    "order_date": "2025-11-19T00:00:00", # Mock required date
                    "Quantity": quantity,
                    "unit price": unit_price,
                    "total price": quantity * unit_price, # Ensure this value is present
                    "pickup": self._insert_data.get("pickup"),
                    "is_delivered": False,
                }
            ]
        return MockResponse() 


# --- 2. MOCK: Dependency Override (ASYNC FIX) ---

# 🔥 FIX 2: override_get_db() MUST be an async generator function 🔥
async def override_get_db(): 
    """Overrides the real get_db dependency with our mock client."""
    yield MockSupabaseClient()

# --- 3. FIXTURE DATA ---
test_order_data = {
    "user_id": "a3e0455d-7c8d-4f0e-9b3a-5c6d7e8f9a11",
    "vendor_id": "b3e0455d-7c8d-4f0e-9b3a-5c6d7e8f9a22",
    "menu_id": "c3e0455d-7c8d-4f0e-9b3a-5c6d7e8f9a33",
    "quantity": 2,
    "unit_price": 50.00,
    "pickup": "Main Campus Cafeteria"
}

# --- 4. TEST CASE ---

# 🔥 FIX 3: The test function MUST be async 🔥
@pytest.mark.asyncio
async def test_create_order_success_stability():
    """
    Tests the successful creation of an order via the API endpoint.
    It proves DI is functional and the success path is stable.
    """
    
    client = TestClient(app)
    
    # CRITICAL DI PROOF: Override the real DB dependency
    app.dependency_overrides[get_db] = override_get_db

    try:
        # API request
        response = client.post("/orders/", json=test_order_data)
        
        # Assertions (Functional Stability)
        
        # Must be 201 Created for a successful POST operation
        assert response.status_code == 201 
        
        response_data = response.json()
        
        # Check the success structure returned by the router/repository
        assert response_data["success"] == True
        assert response_data["message"] == "Order placed successfully"
        assert "order_id" in response_data

    finally:
        # Clear the dependency override
        app.dependency_overrides.clear()