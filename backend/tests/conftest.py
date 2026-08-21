import os
import tempfile
from pathlib import Path

# Ensure background tasks are disabled during tests to avoid flakiness
os.environ.setdefault("DISABLE_BACKGROUND_TASKS", "1")

# Use a safe local test environment so production startup validation does not block pytest.
# Explicit assignments win over any inherited local/CI env values so the suite is deterministic.
_tmp_db_dir = Path(tempfile.gettempdir())
_os_db_path = _tmp_db_dir / f"test_paybot_{os.getpid()}.db"
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_os_db_path.as_posix()}"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-ci"
os.environ["TELEGRAM_BOT_TOKEN"] = "123456:TEST_BOT_TOKEN"
os.environ["TELEGRAM_ADMIN_IDS"] = "123456789"
os.environ["INITIALIZE_DEMO_DATA"] = "1"
# Provider clients read settings at import time. Use inert credentials so unit
# tests can exercise signing and mocked HTTP behavior without live accounts.
os.environ["SWIFTPAY_ACCESS_KEY"] = "test-swiftpay-access-key"
os.environ["SWIFTPAY_SECRET_KEY"] = "test-swiftpay-secret-key"
os.environ["SWIFTPAY_MODE"] = "sandbox"
os.environ["MAGPIE_API_KEY"] = "test-magpie-api-key"
os.environ["MAGPIE_SECRET_KEY"] = "test-magpie-secret-key"

try:
    import pytest_asyncio  # noqa: F401
except ImportError:
    pytest_asyncio = None

pytest_plugins = ["pytest_asyncio"]
