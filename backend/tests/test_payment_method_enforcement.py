import asyncio
import uuid

from fastapi.testclient import TestClient

from core.auth import create_access_token
from core.database import get_db
from main import app
from models.admin_users import AdminUser
from models.merchant_api_config import MerchantApiConfig
from services.transactions import TransactionsService


async def _seed_merchant(enabled_methods: str = "MAYA"):
    user_id = f"merchant-{uuid.uuid4().hex}"
    async for session in get_db():
        session.add(AdminUser(telegram_id=user_id, organization_id=f"org-{user_id}"))
        session.add(
            MerchantApiConfig(
                organization_id=f"org-{user_id}",
                enabled_payment_methods=enabled_methods,
            )
        )
        await session.commit()
        return user_id


def _headers(user_id: str) -> dict[str, str]:
    token = create_access_token({"sub": user_id, "email": f"{user_id}@example.test"})
    return {"Authorization": f"Bearer {token}"}


def test_authenticated_creation_rejects_method_not_enabled_for_merchant():
    with TestClient(app) as client:
        user_id = asyncio.run(_seed_merchant("MAYA"))
        response = client.post(
            "/api/v1/xend/create-payment-link",
            headers=_headers(user_id),
            json={"amount": 100, "payment_methods": ["gcash"]},
        )

    assert response.status_code == 422
    assert response.json()["detail"] == "Payment method not enabled for merchant: GCASH"


def test_checkout_start_allows_only_the_transaction_merchants_enabled_institution():
    with TestClient(app) as client:
        user_id = asyncio.run(_seed_merchant("MAYA"))

        async def seed_transaction():
            async for session in get_db():
                return await TransactionsService(session).create_transaction(
                    user_id=user_id,
                    transaction_type="payment_link",
                    amount=100,
                    external_id=f"checkout-{uuid.uuid4().hex}",
                    payment_url="https://provider.example/pay?order=123",
                )

        transaction = asyncio.run(seed_transaction())
        rejected = client.post(
            f"/api/v1/payments/checkout/{transaction.external_id}/start",
            json={"institution_code": "GCASH"},
        )
        accepted = client.post(
            f"/api/v1/payments/checkout/{transaction.external_id}/start",
            json={"institution_code": "maya"},
        )

    assert rejected.status_code == 422
    assert accepted.status_code == 200
    assert accepted.json()["redirect_url"] == "https://provider.example/pay?order=123&institution_code=MAYA"
