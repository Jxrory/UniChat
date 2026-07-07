import hashlib
import hmac
import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from src.adapters.whatsapp.adapter import WhatsAppAdapter
from tests.wa_helpers import wa_payload, wa_status_payload


@pytest.fixture
def adapter() -> WhatsAppAdapter:
    return WhatsAppAdapter(
        inbox_id="wa-test",
        config={"webhook_secret": "test-wa-secret"},
    )


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

    def test_post_without_signature_returns_true(self, adapter: WhatsAppAdapter) -> None:
        assert adapter.verify_webhook({}, {"content-type": "application/json"}, b"{}") is True

    def test_post_with_valid_signature(self, adapter: WhatsAppAdapter) -> None:
        body = b'{"test": "data"}'
        expected_sig = "sha256=" + hmac.new(
            b"test-wa-secret", body, hashlib.sha256
        ).hexdigest()
        headers = {"x-hub-signature-256": expected_sig}
        assert adapter.verify_webhook({}, headers, body) is True

    def test_post_with_invalid_signature(self, adapter: WhatsAppAdapter) -> None:
        body = b'{"test": "data"}'
        headers = {"x-hub-signature-256": "sha256:invalidsignature"}
        assert adapter.verify_webhook({}, headers, body) is False


class TestParseWebhook:
    def test_valid_text_message(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, wa_payload())
        assert event is not None
        assert event.inbox_id == "wa-test"
        assert event.source_id == "5511999999999"
        assert event.sender_source_id == "5511999999999"
        assert event.content == "Hello"
        assert event.content_type == "text"
        assert event.raw.get("update_id") == "wamid.ABC123"

    def test_different_from_number(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, wa_payload(from_number="5511888888888"))
        assert event is not None
        assert event.source_id == "5511888888888"
        assert event.sender_source_id == "5511888888888"

    def test_different_text(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, wa_payload(text="How are you?"))
        assert event is not None
        assert event.content == "How are you?"

    def test_status_update_returns_none(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, wa_status_payload())
        assert event is None

    def test_non_text_message_type_returns_none(self, adapter: WhatsAppAdapter) -> None:
        event = adapter.parse_webhook({}, wa_payload(msg_type="image"))
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


@pytest.fixture
def send_adapter() -> WhatsAppAdapter:
    return WhatsAppAdapter(
        inbox_id="wa-test",
        config={
            "phone_number_id": "123456789",
            "token": "test-wa-token",
            "webhook_secret": "test-wa-secret",
        },
    )


class TestFormatContent:
    def test_bold_converted(self) -> None:
        result = WhatsAppAdapter._format_content("Hello **world**")
        assert result == "Hello *world*"

    def test_plain_text_unchanged(self) -> None:
        result = WhatsAppAdapter._format_content("Hello world")
        assert result == "Hello world"

    def test_code_fence_preserved(self) -> None:
        result = WhatsAppAdapter._format_content("```code block```")
        assert "```" in result

    def test_empty_string(self) -> None:
        result = WhatsAppAdapter._format_content("")
        assert result == ""


class TestSendMessage:
    async def test_success(self, send_adapter: WhatsAppAdapter) -> None:
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"messages": [{"id": "wamid.new123"}]}
        mock_response.text = ""

        client_mock = AsyncMock(spec=httpx.AsyncClient)
        client_mock.post.return_value = mock_response

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock
            result = await send_adapter.send_message("conv-1", "5511999999999", "Hello")

        assert result.ok is True
        assert result.platform_message_id == "wamid.new123"

    async def test_api_error_400(self, send_adapter: WhatsAppAdapter) -> None:
        mock_response = MagicMock()
        mock_response.is_success = False
        mock_response.status_code = 400
        mock_response.text = '{"error": {"message": "Bad request"}}'

        client_mock = AsyncMock(spec=httpx.AsyncClient)
        client_mock.post.return_value = mock_response

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock
            result = await send_adapter.send_message("conv-1", "5511999999999", "Hello")

        assert result.ok is False
        assert "Bad request" in result.error

    async def test_network_timeout(self, send_adapter: WhatsAppAdapter) -> None:
        client_mock = AsyncMock(spec=httpx.AsyncClient)
        client_mock.post.side_effect = httpx.TimeoutException("Connection timed out")

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock
            result = await send_adapter.send_message("conv-1", "5511999999999", "Hello")

        assert result.ok is False
        assert "timed out" in result.error.lower()

    async def test_unauthorized_401(self, send_adapter: WhatsAppAdapter) -> None:
        mock_response = MagicMock()
        mock_response.is_success = False
        mock_response.status_code = 401
        mock_response.text = '{"error": {"message": "Invalid token"}}'

        client_mock = AsyncMock(spec=httpx.AsyncClient)
        client_mock.post.return_value = mock_response

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock
            result = await send_adapter.send_message("conv-1", "5511999999999", "Hello")

        assert result.ok is False
        assert "Invalid token" in result.error

    async def test_content_gt_4096_chunks(self, send_adapter: WhatsAppAdapter) -> None:
        long_content = "x" * 5000

        mock_response1 = MagicMock()
        mock_response1.is_success = True
        mock_response1.status_code = 200
        mock_response1.json.return_value = {"messages": [{"id": "wamid.chunk1"}]}

        mock_response2 = MagicMock()
        mock_response2.is_success = True
        mock_response2.status_code = 200
        mock_response2.json.return_value = {"messages": [{"id": "wamid.chunk2"}]}

        client_mock = AsyncMock(spec=httpx.AsyncClient)
        client_mock.post.side_effect = [mock_response1, mock_response2]

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock
            result = await send_adapter.send_message("conv-1", "5511999999999", long_content)

        assert result.ok is True
        assert result.platform_message_id == "wamid.chunk1"
        assert client_mock.post.call_count == 2

    async def test_content_exactly_4096_single_message(self, send_adapter: WhatsAppAdapter) -> None:
        exact_content = "y" * 4096

        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"messages": [{"id": "wamid.exact"}]}
        mock_response.text = ""

        client_mock = AsyncMock(spec=httpx.AsyncClient)
        client_mock.post.return_value = mock_response

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock
            result = await send_adapter.send_message("conv-1", "5511999999999", exact_content)

        assert result.ok is True
        assert result.platform_message_id == "wamid.exact"
        assert client_mock.post.call_count == 1

    async def test_missing_phone_number_id(self) -> None:
        adapter = WhatsAppAdapter(
            inbox_id="wa-test",
            config={"token": "test-token", "webhook_secret": "test-secret"},
        )
        result = await adapter.send_message("conv-1", "5511999999999", "Hello")
        assert result.ok is False
        assert result.error == "phone_number_id not configured"

    async def test_missing_token(self) -> None:
        adapter = WhatsAppAdapter(
            inbox_id="wa-test",
            config={"phone_number_id": "123456789", "webhook_secret": "test-secret"},
        )
        result = await adapter.send_message("conv-1", "5511999999999", "Hello")
        assert result.ok is False
        assert result.error == "token not configured"
