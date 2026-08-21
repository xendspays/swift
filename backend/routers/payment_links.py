from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from services.transactions import TransactionsService


router = APIRouter(prefix="/api/v1/payment-links", tags=["payment-links"])


class PaymentLinkResponse(BaseModel):
    id: int
    external_id: str | None = None
    amount: float
    currency: str | None = None
    status: str
    is_active: bool
    title: str | None = None
    order_no: str | None = None
    description: str | None = None
    customer_name: str | None = None
    payment_url: str | None = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaymentLinkStatusUpdate(BaseModel):
    is_active: bool


def _payment_link_response(txn) -> dict:
    return {
        "id": txn.id,
        "external_id": txn.external_id,
        "amount": txn.amount,
        "currency": txn.currency,
        "status": txn.status,
        "is_active": txn.status == "pending",
        "title": txn.title,
        "order_no": txn.order_no,
        "description": txn.description,
        "customer_name": txn.customer_name,
        "payment_url": txn.payment_url,
        "expires_at": txn.expires_at,
        "created_at": txn.created_at,
    }


@router.get("", response_model=List[PaymentLinkResponse])
async def list_payment_links(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    links = await TransactionsService(db).list_payment_links(str(current_user.id), skip, limit)
    return [_payment_link_response(link) for link in links]


@router.get("/{transaction_id}", response_model=PaymentLinkResponse)
async def get_payment_link(
    transaction_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    txn = await TransactionsService(db).get_by_id(transaction_id, user_id=str(current_user.id))
    if not txn or txn.transaction_type not in {"payment_link", "swiftpay_order"}:
        raise HTTPException(status_code=404, detail="Payment link not found")
    return _payment_link_response(txn)


@router.patch("/{transaction_id}", response_model=PaymentLinkResponse)
async def update_payment_link_status(
    transaction_id: int,
    data: PaymentLinkStatusUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        txn = await TransactionsService(db).set_payment_link_active(
            transaction_id, str(current_user.id), data.is_active
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    if not txn:
        raise HTTPException(status_code=404, detail="Payment link not found")
    return _payment_link_response(txn)
