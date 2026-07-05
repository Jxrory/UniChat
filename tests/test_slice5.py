from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.adapters.base import SendResult
from src.adapters.telegram.adapter import TELEGRAM_MAX_LENGTH, TelegramAdapter


@pytest.fixture
def adapter() -> TelegramAdapter:
    return TelegramAdapter(
        inbox_id="tg-test",
        config={
            "token": "test-token",
            "webhook_secret": "test-secret",
        },
    )


class TestNeedsRich:
    def test_plain_text_false(self) -> None:
        assert TelegramAdapter._needs_rich("Hello, world!") is False

    def test_inline_code_false(self) -> None:
        assert TelegramAdapter._needs_rich("Use `code` here") is False

    def test_bold_false(self) -> None:
        assert TelegramAdapter._needs_rich("This is **bold** text") is False

    def test_italic_false(self) -> None:
        assert TelegramAdapter._needs_rich("This is *italic* text") is False

    def test_list_false(self) -> None:
        assert TelegramAdapter._needs_rich("- item one\n- item two") is False

    def test_indented_code_false(self) -> None:
        assert TelegramAdapter._needs_rich("    indented code") is False

    def test_fenced_code_block_true(self) -> None:
        content = "text\n```python\nprint('hello')\n```\nmore"
        assert TelegramAdapter._needs_rich(content) is True

    def test_fenced_code_block_no_language_true(self) -> None:
        content = "text\n```\nprint('hello')\n```\nmore"
        assert TelegramAdapter._needs_rich(content) is True

    def test_single_fence_false(self) -> None:
        assert TelegramAdapter._needs_rich("```\nnot closed") is False

    def test_heading_h1_true(self) -> None:
        assert TelegramAdapter._needs_rich("# Title") is True

    def test_heading_h2_true(self) -> None:
        assert TelegramAdapter._needs_rich("## Section") is True

    def test_heading_h6_true(self) -> None:
        assert TelegramAdapter._needs_rich("###### Tiny") is True

    def test_heading_no_space_false(self) -> None:
        assert TelegramAdapter._needs_rich("#NotHeading") is False

    def test_heading_indented_true(self) -> None:
        assert TelegramAdapter._needs_rich("  # Heading") is True

    def test_pipe_table_separator_true(self) -> None:
        content = "| a | b |\n|---|---|\n| 1 | 2 |"
        assert TelegramAdapter._needs_rich(content) is True

    def test_pipe_table_separator_no_leading_pipe_true(self) -> None:
        content = "a | b\n--- | ---\n1 | 2"
        assert TelegramAdapter._needs_rich(content) is True


class TestSendRichMessage:
    async def test_success_returns_message_id(self, adapter: TelegramAdapter) -> None:
        mock_response = AsyncMock()
        mock_response.is_success = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"ok": True, "result": {"message_id": 42}}

        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=True, platform_message_id="42"))):
            result = await adapter._send_rich_message("123", "test")
            assert result.ok is True
            assert result.platform_message_id == "42"

    async def test_api_error_returns_ok_false(self, adapter: TelegramAdapter) -> None:
        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=False, error="API error"))):
            result = await adapter._send_rich_message("123", "test")
            assert result.ok is False
            assert result.error == "API error"

    async def test_exception_returns_ok_false(self, adapter: TelegramAdapter) -> None:
        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=False, error="connection failed"))):
            result = await adapter._send_rich_message("123", "test")
            assert result.ok is False
            assert result.error == "connection failed"


class TestSendMessageRichRouting:
    async def test_non_rich_content_goes_through_plain_text(self, adapter: TelegramAdapter) -> None:
        with patch.object(adapter, "_send_rich_message", AsyncMock()) as mock_rich:
            with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))):
                result = await adapter.send_message("123", "Hello, world!")
                assert result.ok is True
                mock_rich.assert_not_called()

    async def test_rich_content_calls_send_rich_message(self, adapter: TelegramAdapter) -> None:
        content = "# Heading\n\nSome text"
        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=True, platform_message_id="99"))) as mock_rich:
            with patch.object(adapter, "_send_single", AsyncMock()) as mock_plain:
                result = await adapter.send_message("123", content)
                assert result.ok is True
                assert result.platform_message_id == "99"
                mock_rich.assert_awaited_once_with("123", content)
                mock_plain.assert_not_called()

    async def test_rich_fails_falls_back_to_plain_text(self, adapter: TelegramAdapter) -> None:
        content = "# Heading\n\nSome text"
        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=False, error="API error"))):
            with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=True, platform_message_id="1"))) as mock_plain:
                result = await adapter.send_message("123", content)
                assert result.ok is True
                assert result.platform_message_id == "1"
                mock_plain.assert_awaited_once_with("123", content)

    async def test_rich_fails_fallback_returns_plain_text_failure(self, adapter: TelegramAdapter) -> None:
        content = "# Heading\n\nSome text"
        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=False, error="API error"))):
            with patch.object(adapter, "_send_single", AsyncMock(return_value=SendResult(ok=False, error="plain error"))) as mock_plain:
                result = await adapter.send_message("123", content)
                assert result.ok is False
                assert result.error == "plain error"
                mock_plain.assert_awaited_once_with("123", content)

    async def test_rich_content_with_table_calls_rich(self, adapter: TelegramAdapter) -> None:
        content = "| a | b |\n|---|---|\n| 1 | 2 |"
        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=True, platform_message_id="200"))):
            with patch.object(adapter, "_send_single", AsyncMock()):
                result = await adapter.send_message("123", content)
                assert result.ok is True
                assert result.platform_message_id == "200"

    async def test_rich_content_with_code_block_calls_rich(self, adapter: TelegramAdapter) -> None:
        content = "```python\nprint('hello')\n```"
        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=True, platform_message_id="300"))):
            with patch.object(adapter, "_send_single", AsyncMock()):
                result = await adapter.send_message("123", content)
                assert result.ok is True
                assert result.platform_message_id == "300"


class TestSendRichMessageIntegration:
    async def test_send_rich_message_posts_correct_payload(self, adapter: TelegramAdapter) -> None:
        content = "# Hello\n\nRich content"
        mock_resp = MagicMock()
        mock_resp.is_success = True
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"ok": True, "result": {"message_id": 77}}

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", content)

            assert result.ok is True
            assert result.platform_message_id == "77"

            mock_client.post.assert_called_once()
            _call_args, call_kwargs = mock_client.post.call_args
            assert call_kwargs["json"] == {
                "chat_id": "123",
                "rich_message": {"markdown": content},
            }

    async def test_send_rich_message_api_error_returns_failure(self, adapter: TelegramAdapter) -> None:
        mock_resp = MagicMock()
        mock_resp.is_success = False
        mock_resp.status_code = 400
        mock_resp.text = "Bad Request"

        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.return_value = mock_resp
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", "# Hello")

            assert result.ok is False
            assert "Bad Request" in result.error

    async def test_send_rich_message_exception_returns_failure(self, adapter: TelegramAdapter) -> None:
        with patch("httpx.AsyncClient") as mock_cls:
            mock_client = AsyncMock()
            mock_client.post.side_effect = Exception("Connection timeout")
            mock_cls.return_value.__aenter__.return_value = mock_client

            result = await adapter._send_rich_message("123", "# Hello")

            assert result.ok is False
            assert "Connection timeout" in result.error

    async def test_send_rich_message_no_token_returns_error(self) -> None:
        bad_adapter = TelegramAdapter(inbox_id="bad", config={})
        result = await bad_adapter._send_rich_message("123", "# Hello")
        assert result.ok is False
        assert result.error == "token not configured"

    async def test_rich_message_fallback_to_plain_chunks(self, adapter: TelegramAdapter) -> None:
        content = "# " + "x" * (TELEGRAM_MAX_LENGTH + 10)

        with patch.object(adapter, "_send_rich_message", AsyncMock(return_value=SendResult(ok=False, error="API error"))):
            with patch.object(adapter, "_send_single", AsyncMock()) as mock_single:
                mock_single.side_effect = [
                    SendResult(ok=True, platform_message_id="400"),
                    SendResult(ok=True, platform_message_id="401"),
                ]
                result = await adapter.send_message("123", content)
                assert result.ok is True
                assert result.platform_message_id == "400"
                assert mock_single.await_count == 2
