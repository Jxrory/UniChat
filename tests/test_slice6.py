from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from src.adapters.base import SendResult
from src.adapters.telegram.adapter import TelegramAdapter


@pytest.fixture
def adapter() -> TelegramAdapter:
    return TelegramAdapter(
        inbox_id="tg-test",
        config={
            "token": "test-token",
            "webhook_secret": "test-secret",
        },
    )


RICH_CONTENT = "# Heading\n\nSome **bold** text"
PLAIN_CONTENT = "Hello, world!"


# ── Rich Send Disabled (Latch) ──────────────────────────────────────────────


class TestRichSendDisabled:
    async def test_latch_flag_set_skips_rich(self, adapter: TelegramAdapter) -> None:
        adapter._rich_send_disabled = True
        result = await adapter._send_rich_message("123", RICH_CONTENT)
        assert result.ok is False
        assert result.error == "rich_send_disabled"

    async def test_latch_set_on_404(self, adapter: TelegramAdapter) -> None:
        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 404
        mock_resp.text = '{"ok":false,"error_code":404,"description":"Method not found"}'
        mock_resp.json.return_value = {"ok": False, "error_code": 404, "description": "Method not found"}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is True

    async def test_latch_persists_across_calls(self, adapter: TelegramAdapter) -> None:
        adapter._rich_send_disabled = True
        result1 = await adapter._send_rich_message("123", RICH_CONTENT)
        assert result1.ok is False
        assert result1.error == "rich_send_disabled"

        result2 = await adapter._send_rich_message("456", RICH_CONTENT)
        assert result2.ok is False
        assert result2.error == "rich_send_disabled"


# ── Content Too Long ────────────────────────────────────────────────────────


class TestRichContentTooLong:
    async def test_content_over_limit_skips_rich(self, adapter: TelegramAdapter) -> None:
        content = "x" * (TelegramAdapter.RICH_MESSAGE_MAX_CHARS + 1)
        result = await adapter._send_rich_message("123", content)
        assert result.ok is False
        assert result.error == "content_too_long"

    async def test_content_at_limit_allows_rich(self, adapter: TelegramAdapter) -> None:
        content = "x" * TelegramAdapter.RICH_MESSAGE_MAX_CHARS
        mock_resp = MagicMock()
        mock_resp.is_success = True
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"ok": True, "result": {"message_id": 1}}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", content)

        assert result.ok is True
        assert result.platform_message_id == "1"


# ── Retry Behavior ──────────────────────────────────────────────────────────


class TestRichRetry:
    async def test_timeout_retry_then_success(self, adapter: TelegramAdapter) -> None:
        mock_resp = MagicMock()
        mock_resp.is_success = True
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"ok": True, "result": {"message_id": 42}}

        mock_client1 = AsyncMock()
        mock_client1.post.side_effect = httpx.TimeoutException("timeout")

        mock_client2 = AsyncMock()
        mock_client2.post.return_value = mock_resp

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.side_effect = [mock_client1, mock_client2]

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is True
        assert result.platform_message_id == "42"

    async def test_timeout_retry_then_fallback(self, adapter: TelegramAdapter) -> None:
        mock_client1 = AsyncMock()
        mock_client1.post.side_effect = httpx.TimeoutException("timeout")

        mock_client2 = AsyncMock()
        mock_client2.post.side_effect = httpx.TimeoutException("timeout again")

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.side_effect = [mock_client1, mock_client2]

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert "timeout again" in result.error

    async def test_flood_control_retry_then_success(self, adapter: TelegramAdapter) -> None:
        mock_resp_429 = MagicMock()
        mock_resp_429.is_success = False
        mock_resp_429.status_code = 429
        mock_resp_429.text = "Too Many Requests"
        mock_resp_429.json.return_value = {
            "ok": False,
            "error_code": 429,
            "parameters": {"retry_after": 1},
        }

        mock_resp_200 = MagicMock()
        mock_resp_200.is_success = True
        mock_resp_200.status_code = 200
        mock_resp_200.json.return_value = {"ok": True, "result": {"message_id": 42}}

        mock_client1 = AsyncMock()
        mock_client1.post.return_value = mock_resp_429

        mock_client2 = AsyncMock()
        mock_client2.post.return_value = mock_resp_200

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.side_effect = [mock_client1, mock_client2]
            with patch("asyncio.sleep", AsyncMock()) as mock_sleep:
                result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is True
        assert result.platform_message_id == "42"
        mock_sleep.assert_awaited_once_with(1)

    async def test_flood_control_retry_then_fallback(self, adapter: TelegramAdapter) -> None:
        mock_resp_429 = MagicMock()
        mock_resp_429.is_success = False
        mock_resp_429.status_code = 429
        mock_resp_429.text = "Too Many Requests"
        mock_resp_429.json.return_value = {
            "ok": False,
            "error_code": 429,
            "parameters": {"retry_after": 2},
        }

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_resp_429

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = mock_client
            with patch("asyncio.sleep", AsyncMock()) as mock_sleep:
                result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert "Too Many Requests" in result.error
        assert mock_sleep.await_count == 1

    async def test_permanent_error_no_retry(self, adapter: TelegramAdapter) -> None:
        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 400
        mock_resp.text = "Bad Request"
        mock_resp.json.return_value = {"ok": False, "error_code": 400, "description": "Bad Request"}

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_resp

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is False
        assert mock_client.post.await_count == 1


# ── Error Classification ────────────────────────────────────────────────────


class TestRichErrorClassification:
    async def test_404_latches(self, adapter: TelegramAdapter) -> None:
        assert adapter._rich_send_disabled is False

        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 404
        mock_resp.text = "Not Found"
        mock_resp.json.return_value = {"ok": False, "error_code": 404, "description": "Not Found"}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is True

    async def test_bad_request_no_latch(self, adapter: TelegramAdapter) -> None:
        assert adapter._rich_send_disabled is False

        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 400
        mock_resp.text = "Bad Request"
        mock_resp.json.return_value = {"ok": False, "error_code": 400, "description": "Bad Request"}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is False

    async def test_method_not_found_text_latches(self, adapter: TelegramAdapter) -> None:
        assert adapter._rich_send_disabled is False

        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 200
        mock_resp.text = '{"ok":false,"description":"Method not found"}'
        mock_resp.json.return_value = {"ok": False, "description": "Method not found"}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is True

    async def test_500_no_latch(self, adapter: TelegramAdapter) -> None:
        assert adapter._rich_send_disabled is False

        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 500
        mock_resp.text = "Internal Server Error"
        mock_resp.json.return_value = {"ok": False}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is False

    async def test_network_error_no_latch(self, adapter: TelegramAdapter) -> None:
        assert adapter._rich_send_disabled is False

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.side_effect = httpx.ConnectError("Connection refused")
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is False

    async def test_error_code_in_body_404_latches(self, adapter: TelegramAdapter) -> None:
        assert adapter._rich_send_disabled is False

        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 200
        mock_resp.text = '{"ok":false,"error_code":404}'
        mock_resp.json.return_value = {"ok": False, "error_code": 404}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", RICH_CONTENT)

        assert result.ok is False
        assert adapter._rich_send_disabled is True


# ── Fallback to Plain ───────────────────────────────────────────────────────


class TestRichFallbackToPlain:
    async def test_rich_disabled_falls_back_to_plain(self, adapter: TelegramAdapter) -> None:
        adapter._rich_send_disabled = True

        with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))) as mock_plain:
            result = await adapter.send_message("123", RICH_CONTENT)

        assert result.ok is True
        assert result.platform_message_id == "1"
        mock_plain.assert_awaited_once_with("123", RICH_CONTENT)

    async def test_content_too_long_falls_back_to_plain(self, adapter: TelegramAdapter) -> None:
        content = "# " + "x" * (TelegramAdapter.RICH_MESSAGE_MAX_CHARS)

        with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))) as mock_single:
            result = await adapter.send_message("123", content)

        assert result.ok is True
        assert result.platform_message_id == "1"
        assert mock_single.await_count > 1

    async def test_rich_404_falls_back_to_plain(self, adapter: TelegramAdapter) -> None:
        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 404
        mock_resp.text = "Not Found"
        mock_resp.json.return_value = {"ok": False, "error_code": 404, "description": "Not Found"}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))) as mock_plain:
                result = await adapter.send_message("123", RICH_CONTENT)

        assert result.ok is True
        assert result.platform_message_id == "1"
        mock_plain.assert_awaited_once_with("123", RICH_CONTENT)

    async def test_rich_400_falls_back_to_plain(self, adapter: TelegramAdapter) -> None:
        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 400
        mock_resp.text = "Bad Request"
        mock_resp.json.return_value = {"ok": False, "error_code": 400, "description": "Bad Request"}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))) as mock_plain:
                result = await adapter.send_message("123", RICH_CONTENT)

        assert result.ok is True
        assert result.platform_message_id == "1"
        mock_plain.assert_awaited_once_with("123", RICH_CONTENT)

    async def test_rich_timeout_falls_back_to_plain(self, adapter: TelegramAdapter) -> None:
        mock_client = AsyncMock()
        mock_client.post.side_effect = httpx.TimeoutException("timeout")

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = mock_client

            with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))) as mock_plain:
                result = await adapter.send_message("123", RICH_CONTENT)

        assert result.ok is True
        assert result.platform_message_id == "1"
        mock_plain.assert_awaited_once_with("123", RICH_CONTENT)

    async def test_rich_disabled_plain_text_content_skips_rich(self, adapter: TelegramAdapter) -> None:
        adapter._rich_send_disabled = True

        with patch.object(adapter, "_send_rich_message", AsyncMock()) as mock_rich:
            with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))) as mock_plain:
                result = await adapter.send_message("123", PLAIN_CONTENT)

        assert result.ok is True
        mock_rich.assert_not_called()
        mock_plain.assert_awaited_once_with("123", PLAIN_CONTENT)

    async def test_latched_on_404_then_subsequent_rich_skips_http(self, adapter: TelegramAdapter) -> None:
        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 404
        mock_resp.text = "Not Found"
        mock_resp.json.return_value = {"ok": False, "error_code": 404, "description": "Not Found"}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result1 = await adapter._send_rich_message("123", RICH_CONTENT)
            assert result1.ok is False
            assert adapter._rich_send_disabled is True

        result2 = await adapter._send_rich_message("456", RICH_CONTENT)
        assert result2.ok is False
        assert result2.error == "rich_send_disabled"
