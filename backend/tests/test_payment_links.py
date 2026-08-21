import asyncio
import uuid

from fastapi.testclient import TestClient

from core.auth import create_access_token
from core.database import get_db
from main import app
from services.transactions import TransactionsService


def _token(user_id: str) -> dict[str, str]:
    token = create_access_token({"sub": user_id, "email": f"{user_id}@example.test"})
    return {"Authorization": f"Bearer {token}"}


async def _create_link(user_id: str, status: str = "pending"):
    async for session in get_db():
        return await TransactionsService(session).create_transaction(
            user_id=user_id,
            transaction_type="payment_link",
            amount=125.0,
            external_id=f"payment-link-{uuid.uuid4().hex}",
            status=status,
            title="Test link",
        )


def test_payment_links_are_owner_scoped_and_toggleable():
    with TestClient(app) as client:
        owner_link = asyncio.run(_create_link("link-owner"))
        asyncio.run(_create_link("other-owner"))

        listed = client.get("/api/v1/payment-links", headers=_token("link-owner"))
        assert listed.status_code == 200
        assert [item["id"] for item in listed.json()] == [owner_link.id]
        assert listed.json()[0]["is_active"] is True

        updated = client.patch(
            f"/api/v1/payment-links/{owner_link.id}",
            json={"is_active": False},
            headers=_token("link-owner"),
        )
        assert updated.status_code == 200
        assert updated.json()["status"] == "inactive"
        assert updated.json()["is_active"] is False

        public_checkout = client.get(f"/api/v1/payments/checkout/{owner_link.external_id}")
        assert public_checkout.status_code == 410

        forbidden_owner = client.patch(
            f"/api/v1/payment-links/{owner_link.id}",
            json={"is_active": True},
            headers=_token("other-owner"),
        )
        assert forbidden_owner.status_code == 404


def test_terminal_payment_links_cannot_be_reactivated():
    with TestClient(app) as client:
        paid_link = asyncio.run(_create_link("paid-owner", status="paid"))

        response = client.patch(
            f"/api/v1/payment-links/{paid_link.id}",
            json={"is_active": True},
            headers=_token("paid-owner"),
        )

        assert response.status_code == 409
