import json
from typing import Any

import pytest

from src.adapters.whatsapp.adapter import WhatsAppAdapter


@pytest.fixture
def adapter() -> WhatsAppAdapter:
    return WhatsAppAdapter(
        inbox_id="wa-test",
        config={"webhook_secret": "test-wa-secret"},
    )


def _wa_payload(from_number: str = "5511999999999", text: str = "Hello", msg_type: str = "text") -> bytes:
    msg: dict[str, Any] = {"from": from_number, "id": "wamid.ABC123", "timestamp": "1700000000", "type": msg_type}
    if msg_type == "text":
        msg["text"] = {"body": text}

    return json.dumps({
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "123456789",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {"display_phone_number": "16505551111", "phone_number_id": "123456789"},
                    "contacts": [{"profile": {"name": "Test User"}, "wa_id": from_number}],
                    "messages": [msg],
                },
                "field": "messages",
            }],
        }],
    }).encode()


def _wa_status_payload() -> bytes:
    return json.dumps({
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "123456789",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {"display_phone_number": "16505551111", "phone_number_id": "123456789"},
                    "statuses": [{"id": "wamid.status123", "status": "sent", "timestamp": "1700000001", "recipient_id": "5511999999999"}],
                },
                "field": "messages",
            }],
        }],
    }).encode()


class TestVerifyWebhook:
    def test_get_with_correct_token(self, adapter: WhatsAppAdapter) -> None:
        params = {"hub.mode": "subscribe", "hub.verify_token": "test-wa-secret", "hub.challenge": "12345"}
        assert adapter.verify_webhook(params, {}, b"") is True

    def test_get_with_wrong_token(self, adapter: WhatsAppAdapter) -> None:
        params = {"hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "12345"}
        assert adapter.verify_webhook(params, {}, b"") is False

    def test_get_with_missing_verify_token(self, adapter: WhatsAppAdapter) -> None:
        params = {"hub.mode": "subscribe", "hub.challenge": "12345"}
        assert adapter.verify_webhook(params, {}, b"") is False

    def test_get_with_wrong_mode(self, adapter: WhatsAppAdapter) -> None:
        params = {"hub.mode": "unsubscribe", "hub.verify_token": "test-wa-secret", "hub.challenge": "12345"}
        assert adapter.verify_webhook(params, {}, b"") is False

    def test_post_returns_true(self, adapter: WhatsAppAdapter) -> None:
        assert adapter.verify_webhook({}, {"content-type": "application/json"}, b"{}") is True


class TestParseWebhook:
    def test_valid_text_message(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, _wa_payload())
        assert event is not None
        assert event.inbox_id == "wa-test"
        assert event.source_id == "5511999999999"
        assert event.sender_source_id == "5511999999999"
        assert event.content == "Hello"
        assert event.content_type == "text"
        assert event.raw["update_id"] == "wamid.ABC123"

    def test_different_from_number(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, _wa_payload(from_number="5511888888888"))
        assert event is not None
        assert event.source_id == "5511888888888"
        assert event.sender_source_id == "5511888888888"

    def test_different_text(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, _wa_payload(text="How are you?"))
        assert event is not None
        assert event.content == "How are you?"

    def test_status_update_returns_none(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, _wa_status_payload())
        assert event is None

    def test_non_text_message_type_returns_none(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, _wa_payload(msg_type="image"))
        assert event is None

    def test_image_message_no_text_field(self, adapter: WhatsAppAdapter) -> None:
        payload = json.dumps({
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "123456789",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "16505551111", "phone_number_id": "123456789"},
                        "contacts": [{"profile": {"name": "Test User"}, "wa_id": "5511999999999"}],
                        "messages": [{"from": "5511999999999", "id": "wamid.img123", "timestamp": "1700000000", "type": "image"}],
                    },
                    "field": "messages",
                }],
            }],
        }).encode()
        event = adapter.parse_webhook({}, payload)
        assert event is None

    def test_malformed_json_returns_none(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, b"not json")
        assert event is None

    def test_missing_messages_field_returns_none(self, adapter: WhatsAppAdapter) -> None:
        payload = json.dumps({
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "123456789",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "16505551111", "phone_number_id": "123456789"},
                    },
                    "field": "messages",
                }],
            }],
        }).encode()
        event = adapter.parse_webhook({}, payload)
        assert event is None

    def test_empty_messages_array_returns_none(self, adapter: WhatsAppAdapter) -> None:
        payload = json.dumps({
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "123456789",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "16505551111", "phone_number_id": "123456789"},
                        "messages": [],
                    },
                    "field": "messages",
                }],
            }],
        }).encode()
        event = adapter.parse_webhook({}, payload)
        assert event is None

    def test_missing_entry_returns_none(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, json.dumps({"object": "whatsapp_business_account"}).encode())
        assert event is None
