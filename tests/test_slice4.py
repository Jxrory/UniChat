from unittest.mock import AsyncMock, patch

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


class TestChunkText:
    def test_short_text_single_chunk(self) -> None:
        text = "Hello, world!"
        chunks = TelegramAdapter._chunk_text(text)
        assert chunks == [text]

    def test_text_exactly_at_limit_single_chunk(self) -> None:
        text = "x" * TELEGRAM_MAX_LENGTH
        chunks = TelegramAdapter._chunk_text(text)
        assert chunks == [text]

    def test_text_one_over_limit_two_chunks(self) -> None:
        text = "x" * (TELEGRAM_MAX_LENGTH + 1)
        chunks = TelegramAdapter._chunk_text(text)
        assert len(chunks) == 2
        assert len(chunks[0]) == TELEGRAM_MAX_LENGTH
        assert len(chunks[1]) == 1

    def test_long_text_multiple_chunks(self) -> None:
        text = "x" * (TELEGRAM_MAX_LENGTH * 3 + 100)
        chunks = TelegramAdapter._chunk_text(text)
        assert len(chunks) == 4
        for chunk in chunks[:-1]:
            assert len(chunk) == TELEGRAM_MAX_LENGTH
        assert len(chunks[-1]) == 100

    def test_empty_text_single_chunk(self) -> None:
        chunks = TelegramAdapter._chunk_text("")
        assert chunks == [""]


class TestSendMessageShort:
    async def test_short_message_single_api_call(self, adapter: TelegramAdapter) -> None:
        content = "Hello, world!"
        mock_result = SendResult(ok=True, platform_message_id="100")

        with patch.object(adapter, "_send_single", AsyncMock(return_value=mock_result)) as mock_send:
            result = await adapter.send_message("12345", content)

            assert result.ok is True
            assert result.platform_message_id == "100"
            mock_send.assert_awaited_once_with("12345", content)


class TestSendMessageLong:
    async def test_long_message_splits_into_two_chunks(self, adapter: TelegramAdapter) -> None:
        content = "x" * (TELEGRAM_MAX_LENGTH + 1)
        mock_first = SendResult(ok=True, platform_message_id="200")
        mock_second = SendResult(ok=True, platform_message_id="201")

        with patch.object(adapter, "_send_single", AsyncMock()) as mock_send:
            mock_send.side_effect = [mock_first, mock_second]
            result = await adapter.send_message("12345", content)

            assert result.ok is True
            assert result.platform_message_id == "200"
            assert mock_send.await_count == 2
            assert len(mock_send.await_args_list[0].args[1]) == TELEGRAM_MAX_LENGTH
            assert len(mock_send.await_args_list[1].args[1]) == 1

    async def test_long_message_splits_into_many_chunks(self, adapter: TelegramAdapter) -> None:
        content = "x" * (TELEGRAM_MAX_LENGTH * 3 + 50)
        results = [SendResult(ok=True, platform_message_id=str(300 + i)) for i in range(4)]

        with patch.object(adapter, "_send_single", AsyncMock()) as mock_send:
            mock_send.side_effect = results
            result = await adapter.send_message("12345", content)

            assert result.ok is True
            assert result.platform_message_id == "300"
            assert mock_send.await_count == 4


class TestSendMessageFailure:
    async def test_first_chunk_fails_returns_failure(self, adapter: TelegramAdapter) -> None:
        content = "x" * (TELEGRAM_MAX_LENGTH + 10)

        with patch.object(adapter, "_send_single", AsyncMock()) as mock_send:
            mock_send.side_effect = [
                SendResult(ok=False, error="API error"),
            ]
            result = await adapter.send_message("12345", content)

            assert result.ok is False
            assert result.error == "API error"
            mock_send.assert_awaited_once()

    async def test_mid_send_failure_stops_remaining_chunks(self, adapter: TelegramAdapter) -> None:
        content = "x" * (TELEGRAM_MAX_LENGTH * 3)
        mock_results = [
            SendResult(ok=True, platform_message_id="400"),
            SendResult(ok=False, error="rate limited"),
        ]

        with patch.object(adapter, "_send_single", AsyncMock()) as mock_send:
            mock_send.side_effect = mock_results
            result = await adapter.send_message("12345", content)

            assert result.ok is False
            assert result.error == "rate limited"
            assert mock_send.await_count == 2
