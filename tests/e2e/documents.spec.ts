import { test, expect } from '@playwright/test';

test.describe('Documents', () => {
  test('documents page loads', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await page.waitForLoadState('networkidle');
  });

  test('documents page has filters', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/filtrer|filter|type|statut|status/i);
  });

  test('documents page has search', async ({ page }) => {
    await page.goto('/dashboard/documents');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[type="text"]').first();
    await expect(search).toBeVisible();
  });
});
