import { test, expect } from '@playwright/test';

test('Login page loads successfully', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'FitZone' })).toBeVisible();
  await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('Forgot password page loads', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Forgot Password?' }).click();

  await expect(page).toHaveURL(/forgot-password/);
});

test('Protected admin page redirects unauthenticated users', async ({ page }) => {
  await page.goto('/admin/members');

  await expect(page).toHaveURL(/login/);
});
