from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:5173/login")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/login_page.png")
    page.get_by_placeholder("Email").fill("test@test.com")
    page.get_by_placeholder("Password").fill("123456")
    page.get_by_role("button", name="Login").click()

    page.wait_for_url("http://localhost:5173/app")

    page.goto("http://localhost:5173/app/transactions")
    page.screenshot(path="jules-scratch/verification/transactions_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
