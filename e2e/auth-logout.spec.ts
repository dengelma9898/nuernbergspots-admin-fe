import { expect, test } from '@playwright/test';

import { getE2EAdminCredentials } from './helpers/credentials';
import { loginAsAdmin } from './helpers/login';

test('Abmelden führt zurück zur Login-Seite', async ({ page }) => {
  const creds = getE2EAdminCredentials();
  test.skip(!creds, 'E2E_ADMIN_EMAIL und E2E_ADMIN_PASSWORD müssen gesetzt sein');

  await loginAsAdmin(page, creds);

  await page.getByRole('button', { name: 'Abmelden' }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible({ timeout: 15_000 });
});
