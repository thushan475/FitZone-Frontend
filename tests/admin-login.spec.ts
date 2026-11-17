import { test, expect } from '@playwright/test';

test('Admin can login and access dashboard', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  test.skip(!email || !password, 'Admin test credentials are not configured');

  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill(email!);
  await page.getByPlaceholder('Enter your password').fill(password!);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/admin\/dashboard/, { timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Members', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Trainers' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});
