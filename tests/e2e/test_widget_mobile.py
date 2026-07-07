import pytest
from playwright.sync_api import Page

pytestmark = pytest.mark.e2e

IPHONE_WIDTH = 390
IPHONE_HEIGHT = 844


def _open_widget(page: Page) -> None:
    page.click("#unichat-widget .uw-btn")
    page.wait_for_selector("#unichat-widget .uw-panel", state="visible")


def test_input_font_size_prevents_ios_auto_zoom(page: Page, e2e_server: str) -> None:
    """H1: input font-size must be >=16px to avoid iOS Safari auto-zoom on focus."""
    page.set_viewport_size({"width": IPHONE_WIDTH, "height": IPHONE_HEIGHT})
    page.goto(f"{e2e_server}/static/demo.html")
    _open_widget(page)

    font_size = page.eval_on_selector(
        "#unichat-widget .uw-input",
        "el => parseFloat(getComputedStyle(el).fontSize)",
    )
    assert font_size >= 16, (
        f"input font-size {font_size}px < 16px triggers iOS Safari auto-zoom on focus"
    )


def test_keyboard_does_not_cover_input_bar(page: Page, e2e_server: str) -> None:
    """H2+H3: when visualViewport shrinks (keyboard), panel must resize so the
    input bar bottom stays within the visible viewport."""
    page.set_viewport_size({"width": IPHONE_WIDTH, "height": IPHONE_HEIGHT})
    page.goto(f"{e2e_server}/static/demo.html")
    _open_widget(page)
    page.locator("#unichat-widget .uw-input").focus()

    keyboard_height = 400
    visible_height = IPHONE_HEIGHT - keyboard_height
    page.evaluate(
        """
        ({vh}) => {
            const vv = window.visualViewport;
            Object.defineProperty(vv, 'height', { configurable: true, value: vh });
            Object.defineProperty(vv, 'offsetTop', { configurable: true, value: 0 });
            Object.defineProperty(vv, 'width', { configurable: true, value: window.innerWidth });
            vv.dispatchEvent(new Event('resize'));
        }
        """,
        {"vh": visible_height},
    )
    page.wait_for_timeout(150)

    result = page.eval_on_selector(
        "#unichat-widget .uw-panel",
        """
        (panel) => {
            const bar = panel.querySelector('.uw-input-bar');
            const msgs = panel.querySelector('.uw-messages');
            const pr = panel.getBoundingClientRect();
            const br = bar.getBoundingClientRect();
            const mr = msgs.getBoundingClientRect();
            return {
                barBottom: Math.round(br.bottom),
                vvHeight: window.visualViewport.height,
                panelHeight: Math.round(pr.height),
                msgsTop: Math.round(mr.top),
                msgsVisible: Math.round(mr.height),
            };
        }
        """,
    )

    assert result["barBottom"] <= result["vvHeight"] + 1, (
        f"input bar bottom {result['barBottom']} > visualViewport height "
        f"{result['vvHeight']} — keyboard covers the input"
    )
    assert result["panelHeight"] <= result["vvHeight"] + 1, (
        f"panel height {result['panelHeight']} > visualViewport height "
        f"{result['vvHeight']} — panel extends under the keyboard"
    )
    assert result["msgsTop"] >= -1, (
        f"messages top {result['msgsTop']} < 0 — earlier messages pushed off-screen"
    )
    assert result["msgsVisible"] > 0, "messages area has no visible height"
