import { test, expect } from '@playwright/test';

test('Dashboard verification', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  await expect(page.locator('h3:has-text("Evolução dos Gastos")')).toBeVisible();
  await expect(page.locator('h3:has-text("Progresso dos Orçamentos")')).toBeVisible();
  await expect(page.locator('h3:has-text("Últimas Transações")')).toBeVisible();

  await page.screenshot({ path: 'jules-scratch/verification/dashboard.png' });
});
