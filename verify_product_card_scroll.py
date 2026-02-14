from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Set viewport to mobile size to match app look
    page.set_viewport_size({"width": 390, "height": 844})

    print("Navigating to http://localhost:8081/")
    try:
        page.goto("http://localhost:8081/", timeout=60000)

        # Wait for hero
        page.wait_for_selector("text=Ethereal", timeout=30000)

        print("Scrolling down to find products...")
        # Scroll down
        page.mouse.wheel(0, 1000)
        page.wait_for_timeout(2000)

        # Take screenshot of the product grid area
        print("Taking screenshot of product grid...")
        page.screenshot(path="verification_product_grid.png")
        print("Screenshot saved.")

    except Exception as e:
        print(f"Error: {e}")
        try:
            page.screenshot(path="verification_error.png")
        except:
            pass
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
