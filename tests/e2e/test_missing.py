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
