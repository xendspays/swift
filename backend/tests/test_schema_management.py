from services.database import schema_management_enabled


def test_schema_management_is_enabled_for_local_development(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "dev")
    monkeypatch.delenv("ALLOW_SCHEMA_REPAIR", raising=False)

    assert schema_management_enabled() is True


def test_schema_management_is_enabled_for_tests(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.delenv("ALLOW_SCHEMA_REPAIR", raising=False)

    assert schema_management_enabled() is True


def test_schema_management_is_disabled_in_production(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("ALLOW_SCHEMA_REPAIR", raising=False)

    assert schema_management_enabled() is False


def test_schema_management_can_be_explicitly_enabled_for_repair(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("ALLOW_SCHEMA_REPAIR", "1")

    assert schema_management_enabled() is True
