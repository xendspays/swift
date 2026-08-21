import asyncio
import uuid

from fastapi.testclient import TestClient
from sqlalchemy import select

from core.database import get_db
from main import app
from models.transactions import Transactions
from models.wallet_transactions import Wallet_transactions
from services.swiftpay_service import SwiftPayService
from services.transactions import TransactionsService


async def _create_pending_transaction(reference: str):
    async for session in get_db():
        return await TransactionsService(session).create_transaction(
            user_id=f"webhook-user-{uuid.uuid4().hex}",
            transaction_type="payment_link",
            amount=100.0,
            external_id=reference,
            status="pending",
        )


async def _settlement_state(transaction_id: int):
    async for session in get_db():
        transaction = await session.get(Transactions, transaction_id)
        ledger_entries = (
            await session.execute(
                select(Wallet_transactions).where(
                    Wallet_transactions.reference_id.in_(
                        [transaction.external_id, f"{transaction.external_id}-fee"]
                    )
                )
            )
        ).scalars().all()
        return transaction.status, [(entry.transaction_type, entry.amount) for entry in ledger_entries]


def test_duplicate_successful_swiftpay_callback_credits_wallet_once():
    reference = f"swiftpay-webhook-{uuid.uuid4().hex}"
    transaction = asyncio.run(_create_pending_transaction(reference))
    service = SwiftPayService()
    payload = {
        "x_access_key": service.access_key,
        "x_reference_no": reference,
        "x_payment_id": f"swiftpay-payment-{uuid.uuid4().hex}",
        "x_payment_status": "EXECUTED",
    }
    payload["signature"] = service._sign_payload(payload)

    with TestClient(app) as client:
        first = client.post("/api/v1/swiftpay/webhook", data=payload)
        second = client.post("/api/v1/swiftpay/webhook", data=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    status, ledger_entries = asyncio.run(_settlement_state(transaction.id))
    assert status == "paid"
    assert sorted(ledger_entries) == [("fee", -0.5), ("receive", 100.0)]


def test_duplicate_successful_magpie_callback_credits_wallet_once():
    reference = f"magpie-webhook-{uuid.uuid4().hex}"
    transaction = asyncio.run(_create_pending_transaction(reference))
    payload = {
        "order_id": reference,
        "transaction_id": f"magpie-payment-{uuid.uuid4().hex}",
        "status": "success",
        "amount": 100.0,
    }

    with TestClient(app) as client:
        first = client.post("/api/v1/webhooks/magpie", json=payload)
        second = client.post("/api/v1/webhooks/magpie", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    status, ledger_entries = asyncio.run(_settlement_state(transaction.id))
    assert status == "paid"
    assert sorted(ledger_entries) == [("fee", -0.5), ("receive", 100.0)]
