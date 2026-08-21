"""add merchant enabled payment methods

Revision ID: 20260821_enabled_methods
Revises: 20260821_payment_market
Create Date: 2026-08-21 13:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "20260821_enabled_methods"
down_revision: Union[str, Sequence[str], None] = "20260821_payment_market"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("merchant_api_configs", sa.Column("enabled_payment_methods", sa.String(length=512), nullable=False, server_default=""))


def downgrade() -> None:
    op.drop_column("merchant_api_configs", "enabled_payment_methods")
