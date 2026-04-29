from playwright.sync_api import expect, sync_playwright


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto("http://127.0.0.1:5173/")
        page.wait_for_load_state("networkidle")

        page.get_by_role("button", name="Get Started").first.click()
        page.get_by_role("button", name="Explore the guest demo").click()
        page.wait_for_url("**/dashboard")
        page.get_by_role("button", name="I understand").click()
        expect(page.get_by_text("daily snapshot")).to_be_visible()

        page.goto("http://127.0.0.1:5173/dashboard/more/settings")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name="Settings")).to_be_visible()

        page.get_by_role("button", name="Light").click()
        page.get_by_role("button", name="Save changes").click()
        expect(page.get_by_text("Saved.")).to_be_visible()
        html_class = page.locator("html").get_attribute("class") or ""
        assert "light-theme" in html_class
        assert "dark" not in html_class.split()

        page.reload()
        page.wait_for_load_state("networkidle")
        html_class = page.locator("html").get_attribute("class") or ""
        assert "light-theme" in html_class
        assert "dark" not in html_class.split()

        page.goto("http://127.0.0.1:5173/dashboard/glucose/log")
        page.wait_for_load_state("networkidle")
        page.get_by_role("spinbutton", name="Reading(mg/dL)").fill("123")
        page.get_by_role("button", name="Save reading").click()
        page.wait_for_url("**/dashboard")
        expect(page.get_by_text("123", exact=True).first).to_be_visible()

        page.goto("http://127.0.0.1:5173/dashboard/meals/log")
        page.wait_for_load_state("networkidle")
        page.get_by_label("What did you eat?").fill("Demo toast")
        page.get_by_label("Carbs").fill("42")
        page.get_by_role("button", name="Save meal").click()
        page.wait_for_url("**/dashboard")
        expect(page.get_by_text("Demo toast")).to_be_visible()

        browser.close()


if __name__ == "__main__":
    main()
