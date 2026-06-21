import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('form')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'nonexistent@test.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/erreur|error|incorrect|invalid/i);
  });
});
