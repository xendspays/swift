from collections.abc import Iterable

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.admin_users import AdminUser
from models.merchant_api_config import MerchantApiConfig


async def enabled_payment_methods_for_user(db: AsyncSession, user_id: str) -> set[str]:
    """Return the configured methods for the transaction owner's organization."""
    admin = (
        await db.execute(
            select(AdminUser).where(AdminUser.telegram_id == str(user_id)).limit(1)
        )
    ).scalar_one_or_none()
    if not admin or not admin.organization_id:
        return set()

    config = (
        await db.execute(
            select(MerchantApiConfig)
            .where(MerchantApiConfig.organization_id == admin.organization_id)
            .limit(1)
        )
    ).scalar_one_or_none()
    if not config or not config.enabled_payment_methods:
        return set()
    return {
        method.strip().upper()
        for method in config.enabled_payment_methods.split(",")
        if method.strip()
    }


async def require_enabled_payment_methods(
    db: AsyncSession, user_id: str, methods: Iterable[str] | None
) -> None:
    requested = {str(method).strip().upper() for method in (methods or []) if str(method).strip()}
    if not requested:
        return

    enabled = await enabled_payment_methods_for_user(db, user_id)
    unavailable = requested - enabled
    if unavailable:
        raise HTTPException(
            status_code=422,
            detail=f"Payment method not enabled for merchant: {', '.join(sorted(unavailable))}",
        )
