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


def _headers(user_id: str, organization_id: str | None = None) -> dict[str, str]:
    payload = {"sub": user_id, "email": f"{user_id}@example.test"}
    if organization_id:
        payload["organization_id"] = organization_id
    token = create_access_token(payload)
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


def test_payment_link_checkout_honors_merchant_methods_and_deactivation(monkeypatch):
    user_id = f"merchant-{uuid.uuid4().hex}"
    organization_id = f"org-{user_id}"

    async def seed_merchant():
        async for session in get_db():
            session.add(AdminUser(telegram_id=user_id, organization_id=organization_id))
            await session.commit()

    async def create_provider_order(*, reference_no: str, **_):
        return {
            "success": True,
            "reference_no": reference_no,
            "data": {"paymentId": "provider-order", "customerRedirectUrl": "https://provider.example/pay?order=123"},
        }

    asyncio.run(seed_merchant())
    from routers.xend import payment_gateway

    monkeypatch.setattr(payment_gateway.swift, "create_order", create_provider_order)

    with TestClient(app) as client:
        headers = _headers(user_id, organization_id)
        configured = client.patch(
            "/api/v1/merchant/api-config",
            headers=headers,
            json={"enabled_payment_methods": "maya"},
        )
        assert configured.status_code == 200
        assert configured.json()["enabled_payment_methods"] == "MAYA"

        created = client.post(
            "/api/v1/xend/create-payment-link",
            headers=headers,
            json={"amount": 100, "external_id": f"link-{uuid.uuid4().hex}", "payment_methods": ["maya"]},
        )
        assert created.status_code == 200
        link = created.json()["data"]

        persisted = client.get("/api/v1/payment-links", headers=headers)
        assert persisted.status_code == 200
        assert persisted.json()[0]["id"] == link["transaction_id"]
        external_id = persisted.json()[0]["external_id"]

        public_checkout = client.get(f"/api/v1/payments/checkout/{external_id}")
        assert public_checkout.status_code == 200
        assert public_checkout.json()["status"] == "pending"

        disabled = client.post(
            f"/api/v1/payments/checkout/{external_id}/start",
            json={"institution_code": "gcash"},
        )
        enabled = client.post(
            f"/api/v1/payments/checkout/{external_id}/start",
            json={"institution_code": "maya"},
        )
        assert disabled.status_code == 422
        assert enabled.status_code == 200
        assert enabled.json()["redirect_url"] == "https://provider.example/pay?order=123&institution_code=MAYA"

        deactivated = client.patch(
            f"/api/v1/payment-links/{link['transaction_id']}",
            headers=headers,
            json={"is_active": False},
        )
        assert deactivated.status_code == 200

        assert client.get(f"/api/v1/payments/checkout/{external_id}").status_code == 410
        assert client.post(
            f"/api/v1/payments/checkout/{external_id}/start",
            json={"institution_code": "maya"},
        ).status_code == 410
