import { test, expect } from '@playwright/test';

test.describe('Editor', () => {
  test('editor page loads', async ({ page }) => {
    await page.goto('/dashboard/editor');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/editor-load.png' });
  });

  test('editor has section tabs', async ({ page }) => {
    await page.goto('/dashboard/editor');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/item|article|prestation/i);
  });

  test('editor shows totals', async ({ page }) => {
    await page.goto('/dashboard/editor');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).toMatch(/total|TVA|HT|TTC/i);
  });
});
