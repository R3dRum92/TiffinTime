from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi import status
from httpx import ASGITransport, AsyncClient

from app.schemas import PaymentInitiationRequest
from main import app


# Mock the SSLCOMMERZ library
@pytest.fixture
def mock_sslcommerz():
    mock = MagicMock()
    mock.createSession.return_value = {
        "status": "SUCCESS",
        "sessionkey": "some_session_key",
    }
    mock.validationTransactionOrder.return_value = {
        "status": "VALID",
        "tran_id": "some_tran_id",
    }
    return mock


# Mock the database client
@pytest.fixture
def mock_db_client():
    mock = AsyncMock()

    builder_mock = MagicMock()

    builder_mock.insert.return_value = builder_mock
    builder_mock.update.return_value = builder_mock
    builder_mock.eq.return_value = builder_mock

    mock_response = MagicMock()
    mock_response.data = [{"id": "test_id", "status": "success"}]

    builder_mock.execute = AsyncMock(return_value=mock_response)

    mock.from_ = MagicMock(return_value=builder_mock)

    return mock


# Apply mocks to the app
@pytest.fixture(autouse=True)
def override_dependencies(mock_sslcommerz, mock_db_client):
    from app.repositories.payment import get_sslcommerz
    from db.supabase import get_db

    app.dependency_overrides[get_sslcommerz] = lambda: mock_sslcommerz
    app.dependency_overrides[get_db] = lambda: mock_db_client
    yield
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_init_payment(mock_db_client):
    """
    Test the /payment/init endpoint.
    """
    user_id = uuid4()
    order_id = uuid4()
    request_data = {
        "user_id": str(user_id),
        "order_id": str(order_id),
        "total_amount": 100.0,
        "tran_id": "test_tran_id",
        "cus_name": "Test User",
        "cus_email": "test@example.com",
        "cus_phone": "01234567890",
        "cus_add1": "Test Address",
        "cus_city": "Test City",
        "num_of_item": 1,
        "product_name": "Test Product",
        "product_category": "Test Category",
    }

    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/payment/init", json=request_data)

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "SUCCESS"
    mock_db_client.from_.assert_called_with("payments")
    mock_db_client.from_().insert.assert_called_once()


@pytest.mark.asyncio
async def test_payment_success(mock_db_client):
    """
    Test the /payment/success endpoint.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/payment/success", params={"val_id": "some_val_id"}
        )

    assert response.status_code == status.HTTP_200_OK
    mock_db_client.from_.assert_called_with("payments")
    mock_db_client.from_().update.assert_called_once()


@pytest.mark.asyncio
async def test_payment_fail(mock_db_client):
    """
    Test the /payment/fail endpoint.
    """
    request_data = {"tran_id": "test_tran_id"}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/payment/fail", json=request_data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    mock_db_client.from_().update.assert_called_once()


@pytest.mark.asyncio
async def test_payment_cancel(mock_db_client):
    """
    Test the /payment/cancel endpoint.
    """
    request_data = {"tran_id": "test_tran_id"}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/payment/cancel", json=request_data)

    assert response.status_code == status.HTTP_200_OK
    mock_db_client.from_().update.assert_called_once()
