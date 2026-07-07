import re

import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e


class TestWebSocketPush:
    """E6: WS push message.created -> conv-list + message-panel auto refresh (P0)."""

    def test_ws_push_refreshes_conv_list(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.wait_for_timeout(1000)

        url_before = page.url

        resp = page.request.post(
            f"{e2e_server}/webhooks/test/tg",
            headers={"X-Webhook-Secret": "e2e-secret"},
            data='{"text":"E2E WS push test","source_id":"e2e-ws-user","sender_source_id":"e2e-ws-user"}',
        )
        assert resp.status == 200

        page.get_by_test_id("conv-row").first.wait_for(state="visible", timeout=5000)

        assert page.url.rstrip("/") == url_before.rstrip("/")

        rows_text = page.get_by_test_id("conv-row").all_text_contents()
        has_new = any("e2e-ws-user" in t for t in rows_text)
        assert has_new, f"New conversation not found in rows: {rows_text}"


    def test_ws_push_refreshes_message_panel_same_conversation(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("message-panel").wait_for(state="visible", timeout=3000)

        page.wait_for_timeout(1000)

        resp = page.request.post(
            f"{e2e_server}/webhooks/test/tg",
            headers={"X-Webhook-Secret": "e2e-secret"},
            data='{"text":"Same conv WS push","source_id":"e2e-user-1","sender_source_id":"e2e-user-1"}',
        )
        assert resp.status == 200

        page.wait_for_timeout(1000)

        bubbles = page.get_by_test_id("msg-bubble").all_text_contents()
        has_new = any("Same conv WS push" in t for t in bubbles)
        assert has_new, f"New message not found in bubbles: {bubbles}"

    def test_ws_push_does_not_refresh_message_panel_different_conversation(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("message-panel").wait_for(state="visible", timeout=3000)

        page.wait_for_timeout(1000)

        bubbles_before = page.get_by_test_id("msg-bubble").all_text_contents()

        resp = page.request.post(
            f"{e2e_server}/webhooks/test/tg",
            headers={"X-Webhook-Secret": "e2e-secret"},
            data='{"text":"Different conv WS push","source_id":"e2e-other-user","sender_source_id":"e2e-other-user"}',
        )
        assert resp.status == 200

        page.wait_for_timeout(1000)

        bubbles_after = page.get_by_test_id("msg-bubble").all_text_contents()
        assert bubbles_after == bubbles_before, (
            f"Message panel should not change; before={bubbles_before} after={bubbles_after}"
        )


    def test_ws_push_refreshes_message_panel_for_bot_reply(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        """Bot reply via OutComing bus -> WS push message_type=outgoing -> panel refresh."""
        conv_id = seeded_conversation["conv_id"]

        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("message-panel").wait_for(state="visible", timeout=3000)

        page.wait_for_timeout(1000)

        resp = page.request.post(
            f"{e2e_server}/api/v1/agentbot/reply",
            headers={"Authorization": "Bearer e2e-token", "Content-Type": "application/json"},
            data=f'{{"conversation_id":"{conv_id}","content":"Bot reply via WS","handoff":false}}',
        )
        assert resp.status == 200

        bot_bubble = page.locator(
            '[data-testid="msg-bubble"][data-sender="agentbot"]'
        )
        expect(bot_bubble.first).to_be_visible(timeout=5000)
        expect(bot_bubble.first).to_contain_text("Bot reply via WS")

        # agentbot bubble should be right-aligned via CSS
        expect(bot_bubble.first).to_have_class(
            re.compile(r"msg-bubble-agentbot")
        )


    def test_ws_push_no_duplicate_message_panel(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        """WS push must not create duplicate #message-panel elements."""
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("message-panel").wait_for(state="visible", timeout=3000)
        page.wait_for_timeout(1000)

        # Send webhook + bot reply rapidly (triggers two WS pushes)
        resp = page.request.post(
            f"{e2e_server}/webhooks/test/tg",
            headers={"X-Webhook-Secret": "e2e-secret"},
            data='{"text":"Rapid fire","source_id":"e2e-user-1","sender_source_id":"e2e-user-1"}',
        )
        assert resp.status == 200

        page.wait_for_timeout(2000)

        panels = page.evaluate(
            "document.querySelectorAll('#message-panel').length"
        )
        assert panels == 1, f"Expected 1 #message-panel, got {panels}"

    def test_ws_push_multiple_messages_maintains_ordering(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        """Multiple messages to same conv — conv stays at top of list."""
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")
        page.wait_for_timeout(1000)

        # Get first row's conv-id before any messages
        first_row = page.get_by_test_id("conv-row").first
        original_id = first_row.get_attribute("data-conv-id")

        # Send multiple messages to this conversation
        for i in range(3):
            resp = page.request.post(
                f"{e2e_server}/webhooks/test/tg",
                headers={"X-Webhook-Secret": "e2e-secret"},
                data=f'{{"text":"Follow-up {i}","source_id":"e2e-user-1","sender_source_id":"e2e-user-1"}}',
            )
            assert resp.status == 200
            page.wait_for_timeout(1000)

        page.wait_for_timeout(1000)

        # The seeded conversation should still be first (most recent activity)
        first_row = page.get_by_test_id("conv-row").first
        current_id = first_row.get_attribute("data-conv-id")
        assert current_id == original_id, (
            f"Expected conv {original_id} at top, got {current_id}"
        )

    def test_ws_push_no_cross_contamination_on_other_conv(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        """Push to conv A, then click conv B — must show only conv B's messages."""
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        # Create a second conversation via webhook
        resp = page.request.post(
            f"{e2e_server}/webhooks/test/tg",
            headers={"X-Webhook-Secret": "e2e-secret"},
            data='{"text":"Second conv","source_id":"e2e-second-user","sender_source_id":"e2e-second-user"}',
        )
        assert resp.status == 200
        page.wait_for_timeout(2000)

        conv_rows = page.get_by_test_id("conv-row")
        assert conv_rows.count() >= 2

        # Click the seeded conversation (first conv row)
        conv_rows.first.click()
        page.get_by_test_id("message-panel").wait_for(state="visible", timeout=3000)
        page.wait_for_timeout(500)

        # Send a message to the seeded conversation via WS push
        resp = page.request.post(
            f"{e2e_server}/webhooks/test/tg",
            headers={"X-Webhook-Secret": "e2e-secret"},
            data='{"text":"New msg for seeded conv","source_id":"e2e-user-1","sender_source_id":"e2e-user-1"}',
        )
        assert resp.status == 200
        page.wait_for_timeout(2000)

        # Now click the second conversation
        conv_rows = page.get_by_test_id("conv-row")
        conv_rows.nth(1).click()
        page.wait_for_timeout(1500)

        bubbles = page.get_by_test_id("msg-bubble").all_text_contents()
        combined = " ".join(bubbles)
        assert "Second conv" in combined, f"Expected second conv message in {combined}"
        assert "New msg for seeded conv" not in combined, (
            f"Seeded conv message leaked into second conv: {combined}"
        )


    def test_ws_push_preserves_scroll_position(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        """WS push must not reset .msg-container scroll to top (bug fix)."""
        # Seed extra messages so the container overflows and is scrollable
        for i in range(10):
            text = f"Seed message {i} for scroll test padding to make container overflow with enough content"
            page.request.post(
                f"{e2e_server}/webhooks/test/tg",
                headers={"X-Webhook-Secret": "e2e-secret"},
                data=f'{{"text":"{text}","source_id":"e2e-user-1","sender_source_id":"e2e-user-1"}}',
            )
        page.wait_for_timeout(1500)

        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("message-panel").wait_for(state="visible", timeout=3000)
        page.wait_for_timeout(1000)

        # Ensure the container is scrollable
        scrollable = page.evaluate("""() => {
            const c = document.querySelector('.msg-container');
            return c && c.scrollHeight > c.clientHeight;
        }""")
        assert scrollable, "Precondition: .msg-container must be scrollable (more content than viewport)"

        # Scroll down — simulating reading older messages
        page.evaluate("""() => {
            const c = document.querySelector('.msg-container');
            c.scrollTop = c.scrollHeight / 2;
        }""")
        page.wait_for_timeout(200)

        scroll_before = page.evaluate(
            "document.querySelector('.msg-container').scrollTop"
        )
        assert scroll_before > 0, "Precondition: scroll must be > 0 before push"

        resp = page.request.post(
            f"{e2e_server}/webhooks/test/tg",
            headers={"X-Webhook-Secret": "e2e-secret"},
            data='{"text":"Scroll test message","source_id":"e2e-user-1","sender_source_id":"e2e-user-1"}',
        )
        assert resp.status == 200
        page.wait_for_timeout(2000)

        scroll_after = page.evaluate(
            "document.querySelector('.msg-container').scrollTop"
        )
        # Must not be reset to 0 (the bug)
        assert scroll_after > 0, (
            f"Scroll position reset to top! before={scroll_before} after={scroll_after}"
        )


class TestWebSocketReload:
    """E7: WS onclose -> 5s location.reload() (P1)."""

    def test_ws_onclose_reloads_page_after_delay(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.add_init_script("""
            window.__e2e_last_ws = null;
            var orig_ws = window.WebSocket;
            window.WebSocket = function(url, protocols) {
                var ws = new orig_ws(url, protocols);
                window.__e2e_last_ws = ws;
                return ws;
            };
            window.WebSocket.prototype = orig_ws.prototype;
            window.WebSocket.CONNECTING = orig_ws.CONNECTING;
            window.WebSocket.OPEN = orig_ws.OPEN;
            window.WebSocket.CLOSING = orig_ws.CLOSING;
            window.WebSocket.CLOSED = orig_ws.CLOSED;
        """)

        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.wait_for_timeout(1000)

        with page.expect_navigation(timeout=15000):
            page.evaluate("window.__e2e_last_ws && window.__e2e_last_ws.close()")

        page.wait_for_url("**/admin")
        expect(page.get_by_test_id("conv-list")).to_be_visible()


class TestMobileViewport:
    """E9: Mobile viewport 375px layout check (P2)."""

    def test_mobile_viewport_no_layout_overflow(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.set_viewport_size({"width": 375, "height": 667})

        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        layout_width = page.evaluate(
            "document.querySelector('.admin-layout')?.scrollWidth"
        )
        viewport_width = page.evaluate(
            "document.documentElement.clientWidth"
        )
        assert layout_width is not None
        assert layout_width <= viewport_width + 1, (
            f"Layout overflow: scrollWidth={layout_width} > clientWidth={viewport_width}"
        )

        conv_list_width = page.evaluate(
            "document.querySelector('.conv-list')?.offsetWidth"
        )
        assert conv_list_width == 320, (
            f"conv-list width expected 320, got {conv_list_width}"
        )

        expect(page.get_by_test_id("conv-list")).to_be_visible()
        expect(page.get_by_test_id("message-panel")).to_be_visible()


class TestUnauthenticatedRedirect:
    """E10: Unauthenticated direct access -> redirect to login (P2)."""

    def test_unauthenticated_admin_redirects_to_login(
        self, page: Page, e2e_server: str
    ) -> None:
        page.goto(f"{e2e_server}/admin")
        page.wait_for_url("**/admin/login")
        expect(page.get_by_test_id("login-token")).to_be_visible()

    def test_unauthenticated_messages_redirects_to_login(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        conv_id = seeded_conversation["conv_id"]
        page.goto(f"{e2e_server}/admin/conversations/{conv_id}/messages")
        page.wait_for_url("**/admin/login")
        expect(page.get_by_test_id("login-token")).to_be_visible()
