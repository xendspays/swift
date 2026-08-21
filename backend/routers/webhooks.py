"""Webhook handlers for payment integrations

Handles callbacks from:
- SwiftPay (Local PH payments: GCash, Maya, Bank Transfer, QR)
- Magpie (International: Visa, Mastercard, Alipay, WeChat Pay)
"""
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from services.transactions import TransactionsService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


async def _apply_payment_callback(
    db: AsyncSession,
    external_id: str,
    provider_reference: str,
    status: str,
    gateway_label: str,
) -> None:
    """Apply terminal provider status through the idempotent transaction service."""
    if not external_id:
        return

    txn_service = TransactionsService(db)
    txn = await txn_service.find_by_external_or_gateway_id(external_id)
    if not txn:
        logger.info("%s webhook: no local transaction for %s", gateway_label, external_id)
        return

    if provider_reference and not txn.xendit_id:
        txn.xendit_id = provider_reference

    normalized_status = status.strip().lower()
    if normalized_status in {"success", "completed", "paid"}:
        # mark_as_paid returns before touching the wallet for already-settled callbacks.
        await txn_service.mark_as_paid(txn, gateway_label=gateway_label)
    elif normalized_status in {"failed", "cancelled", "canceled", "expired"}:
        await txn_service.mark_as_expired(txn)
    else:
        await db.commit()


@router.post("/swiftpay")
async def swiftpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle SwiftPay payment callbacks
    
    SwiftPay processes:
    - GCash payments
    - Maya payments
    - Bank transfers
    - QR Code payments
    """
    try:
        payload = await request.json()
        
        reference_no = payload.get("reference_no", "")
        status = payload.get("status", "")
        payment_id = payload.get("payment_id", "")
        amount = payload.get("amount", 0)
        
        logger.info(f"SwiftPay webhook: reference_no={reference_no}, status={status}, amount={amount}")
        
        await _apply_payment_callback(
            db, reference_no, payment_id, status, gateway_label="SwiftPay"
        )
        
        return {"success": True, "received": True, "reference_no": reference_no}
    except Exception as e:
        logger.error(f"SwiftPay webhook error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@router.post("/magpie")
async def magpie_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Magpie payment callbacks
    
    Magpie processes:
    - Visa card payments
    - Mastercard card payments
    - Alipay payments
    - WeChat Pay payments
    """
    try:
        payload = await request.json()
        
        order_id = payload.get("order_id", "")
        status = payload.get("status", "")
        transaction_id = payload.get("transaction_id", "")
        amount = payload.get("amount", 0)
        payment_method = payload.get("payment_method", "")
        
        logger.info(f"Magpie webhook: order_id={order_id}, status={status}, method={payment_method}, amount={amount}")
        
        await _apply_payment_callback(
            db, order_id, transaction_id, status, gateway_label="Magpie"
        )
        
        return {"success": True, "received": True, "order_id": order_id}
    except Exception as e:
        logger.error(f"Magpie webhook error: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@router.get("/test")
async def test_webhook():
    """Test endpoint to verify webhooks are running"""
    return {
        "message": "Payment webhooks endpoint is operational",
        "providers": {
            "swiftpay": "Local PH payments (GCash, Maya, Bank, QR)",
            "magpie": "International payments (Visa, Mastercard, Alipay, WeChat)"
        },
        "endpoints": {
            "swiftpay": "/api/v1/webhooks/swiftpay",
            "magpie": "/api/v1/webhooks/magpie"
        }
    }
