import json
from typing import Any

from src.adapters.base import SendResult
from src.adapters.test.adapter import TestAdapter


class TestTestAdapter:
    def test_verify_webhook_matching_secret(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={"webhook_secret": "my-secret"})
        assert adapter.verify_webhook({}, {"x-webhook-secret": "my-secret"}, b"{}")

    def test_verify_webhook_wrong_secret(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={"webhook_secret": "my-secret"})
        assert not adapter.verify_webhook({}, {"x-webhook-secret": "wrong"}, b"{}")

    def test_verify_webhook_missing_header(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={"webhook_secret": "my-secret"})
        assert not adapter.verify_webhook({}, {}, b"{}")

    def test_verify_webhook_no_secret_configured(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        assert adapter.verify_webhook({}, {}, b"{}")

    def test_verify_webhook_no_secret_with_header_ignored(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        assert adapter.verify_webhook({}, {"x-webhook-secret": "anything"}, b"{}")

    def test_verify_webhook_case_insensitive_header(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={"webhook_secret": "my-secret"})
        assert adapter.verify_webhook({}, {"X-Webhook-Secret": "my-secret"}, b"{}")
        assert adapter.verify_webhook({}, {"X-WEBHOOK-SECRET": "my-secret"}, b"{}")

    def test_parse_webhook_valid_json_with_all_fields(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({
            "text": "hello world",
            "source_id": "user-1",
            "sender_source_id": "user-1",
            "msg_id": "msg-123",
        }).encode()
        event = adapter.parse_webhook({}, body)
        assert event is not None
        assert event.inbox_id == "test"
        assert event.source_id == "user-1"
        assert event.sender_source_id == "user-1"
        assert event.content == "hello world"
        assert event.content_type == "text"
        assert event.raw["update_id"] == "msg-123"
        assert event.raw["text"] == "hello world"

    def test_parse_webhook_missing_text_returns_none(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({"source_id": "user-1"}).encode()
        assert adapter.parse_webhook({}, body) is None

    def test_parse_webhook_empty_text_returns_none(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({"text": ""}).encode()
        assert adapter.parse_webhook({}, body) is None

    def test_parse_webhook_non_json_body_returns_none(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        assert adapter.parse_webhook({}, b"not-json") is None

    def test_parse_webhook_empty_body_returns_none(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        assert adapter.parse_webhook({}, b"") is None

    def test_parse_webhook_default_source_id(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({"text": "hello"}).encode()
        event = adapter.parse_webhook({}, body)
        assert event is not None
        assert event.source_id == "test-user"
        assert event.sender_source_id == "test-user"

    def test_parse_webhook_custom_source_id(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({"text": "hello", "source_id": "alice", "sender_source_id": "alice"}).encode()
        event = adapter.parse_webhook({}, body)
        assert event is not None
        assert event.source_id == "alice"
        assert event.sender_source_id == "alice"

    def test_parse_webhook_different_source_and_sender(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({"text": "hello", "source_id": "chat-1", "sender_source_id": "user-42"}).encode()
        event = adapter.parse_webhook({}, body)
        assert event is not None
        assert event.source_id == "chat-1"
        assert event.sender_source_id == "user-42"

    def test_parse_webhook_update_id_from_body(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({"text": "hello", "update_id": "custom-update-1"}).encode()
        event = adapter.parse_webhook({}, body)
        assert event is not None
        assert event.raw["update_id"] == "custom-update-1"

    def test_parse_webhook_update_id_fallback_to_uuid(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        body = json.dumps({"text": "hello"}).encode()
        event = adapter.parse_webhook({}, body)
        assert event is not None
        assert len(event.raw["update_id"]) == 32  # uuid4().hex

    async def test_send_message_returns_ok(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        result = await adapter.send_message("conv-1", "user-1", "hello")
        assert isinstance(result, SendResult)
        assert result.ok is True

    async def test_send_message_platform_id_starts_with_test(self) -> None:
        adapter = TestAdapter(inbox_id="test", config={})
        result = await adapter.send_message("conv-1", "user-1", "hello")
        assert result.platform_message_id is not None
        assert result.platform_message_id.startswith("test-")
        assert len(result.platform_message_id) == 13  # "test-" + 8 hex chars

    async def test_send_message_with_caplog(self, caplog: Any) -> None:
        import logging

        caplog.set_level(logging.INFO)
        adapter = TestAdapter(inbox_id="test", config={})
        result = await adapter.send_message("conv-1", "test-user-1", "hello world")
        assert result.ok is True
        assert result.platform_message_id is not None
        assert result.platform_message_id.startswith("test-")
        assert "Would send to test-user-1" in caplog.text
