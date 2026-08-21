"""add merchant payment market settings

Revision ID: 20260821_payment_market
Revises: 20260816_kyb_reference_code, dea6fbf38c9f
Create Date: 2026-08-21 12:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "20260821_payment_market"
down_revision: Union[str, Sequence[str], None] = ("20260816_kyb_reference_code", "dea6fbf38c9f")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "merchant_api_configs",
        sa.Column("payment_market", sa.String(length=8), nullable=False, server_default="PH"),
    )
    op.add_column(
        "merchant_api_configs",
        sa.Column("default_settlement_method", sa.String(length=32), nullable=False, server_default="local_t0"),
    )


def downgrade() -> None:
    op.drop_column("merchant_api_configs", "default_settlement_method")
    op.drop_column("merchant_api_configs", "payment_market")
