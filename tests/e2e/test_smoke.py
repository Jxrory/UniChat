import pytest
from playwright.sync_api import Page, expect

pytestmark = pytest.mark.e2e


class TestLogin:
    def test_login_page_loads(self, page: Page, e2e_server: str) -> None:
        page.goto(f"{e2e_server}/admin/login")
        expect(page.get_by_test_id("login-token")).to_be_visible()
        expect(page.get_by_test_id("login-submit")).to_be_visible()

    def test_login_with_correct_token_redirects_to_admin(
        self, page: Page, e2e_server: str
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")
        expect(page.get_by_test_id("conv-list")).to_be_visible()

    def test_login_with_wrong_token_shows_error(
        self, page: Page, e2e_server: str
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("wrong-token")
        page.get_by_test_id("login-submit").click()
        expect(page.get_by_test_id("login-error")).to_be_visible()
        expect(page.get_by_test_id("login-error")).to_contain_text("不正确")


class TestConversation:
    def test_seeded_conversation_appears_in_list(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        conv_rows = page.get_by_test_id("conv-row")
        expect(conv_rows.first).to_be_visible()
        expect(conv_rows.first).to_contain_text("E2E User")

    def test_click_conversation_loads_messages(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("msg-bubble").first.wait_for(state="visible", timeout=3000)
        bubbles = page.get_by_test_id("msg-bubble").all()
        assert len(bubbles) >= 1
        expect(page.get_by_test_id("reply-input")).to_be_visible()
        expect(page.get_by_test_id("reply-submit")).to_be_visible()

    def test_reply_via_htmx_adds_bubble(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("msg-bubble").first.wait_for(state="visible", timeout=3000)

        page.get_by_test_id("reply-input").fill("Test reply from admin")
        page.get_by_test_id("reply-submit").click()

        page.locator('[data-testid="msg-bubble"][data-sender="user"]').wait_for(
            state="visible", timeout=3000
        )
        user_bubbles = page.locator(
            '[data-testid="msg-bubble"][data-sender="user"]'
        ).all()
        assert len(user_bubbles) == 1
        expect(user_bubbles[0]).to_contain_text("Test reply from admin")

    def test_resolve_conversation_updates_status(
        self, page: Page, e2e_server: str, seeded_conversation: dict
    ) -> None:
        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")

        page.get_by_test_id("conv-row").first.click()
        page.get_by_test_id("msg-bubble").first.wait_for(state="visible", timeout=3000)

        page.get_by_test_id("resolve-btn").click()
        page.get_by_test_id("conv-status").wait_for(state="visible", timeout=3000)
        expect(page.get_by_test_id("conv-status")).to_contain_text("resolved")


class TestConsole:
    def test_no_console_errors_during_login_flow(
        self, page: Page, e2e_server: str
    ) -> None:
        console_errors: list[str] = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        page.goto(f"{e2e_server}/admin/login")
        page.get_by_test_id("login-token").fill("e2e-token")
        page.get_by_test_id("login-submit").click()
        page.wait_for_url("**/admin")
        page.wait_for_timeout(1000)

        assert console_errors == [], f"Console errors found: {console_errors}"
