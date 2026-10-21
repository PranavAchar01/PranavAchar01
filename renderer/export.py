"""Render every tile in icons2d.html to icons/<slug>.png (needs: uv run --with playwright)."""
import pathlib
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    page = b.new_page(viewport={"width": 1712, "height": 2400})
    page.goto((root / "icons2d.html").as_uri())
    page.wait_for_function("window.__done === true")
    page.evaluate("document.fonts.ready")
    for el in page.query_selector_all(".tile"):
        slug = el.get_attribute("id").removeprefix("tile-")
        el.screenshot(path=str(root.parent / "icons" / f"{slug}.png"))
    b.close()
