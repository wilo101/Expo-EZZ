from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to http://localhost:8081/")
    try:
        page.goto("http://localhost:8081/", timeout=60000)

        # Wait for products to load. They have text with price/name.
        # ProductCard renders text with currency.
        print("Waiting for product card content...")
        # Try to find an element with text that looks like a price or "NEW" badge
        page.wait_for_selector("text=NEW", timeout=30000)

        print("Taking screenshot...")
        page.screenshot(path="verification_product_card.png")
        print("Screenshot saved.")

    except Exception as e:
        print(f"Error: {e}")
        # Take screenshot of error state if possible
        try:
            page.screenshot(path="verification_error.png")
        except:
            pass
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
