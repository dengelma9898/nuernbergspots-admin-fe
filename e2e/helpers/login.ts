import { expect, type Page } from '@playwright/test';

import type { E2EAdminCredentials } from './credentials';

export async function loginAsAdmin(page: Page, creds: E2EAdminCredentials): Promise<void> {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
  await page.getByLabel('E-Mail').fill(creds.email);
  // exact: true → trifft nur das Passwort-Input, nicht den Toggle-Button
  // ("Passwort anzeigen"/"Passwort verbergen", aria-label enthält "Passwort").
  await page.getByLabel('Passwort', { exact: true }).fill(creds.password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
    timeout: 30_000,
  });
}
