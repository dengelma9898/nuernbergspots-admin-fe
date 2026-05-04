import { expect, type Page } from '@playwright/test';

import type { E2EAdminCredentials } from './credentials';

export async function loginAsAdmin(page: Page, creds: E2EAdminCredentials): Promise<void> {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
  await page.getByLabel('E-Mail').fill(creds.email);
  await page.getByLabel('Passwort').fill(creds.password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
    timeout: 30_000,
  });
}
