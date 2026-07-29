import { test, expect } from '@playwright/test';

import { getE2EAdminCredentials } from './helpers/credentials';
import { loginAsAdmin } from './helpers/login';

test('nach Login ist die User-Block-Verwaltung erreichbar', async ({ page }) => {
  const creds = getE2EAdminCredentials();
  test.skip(!creds, 'E2E_ADMIN_EMAIL und E2E_ADMIN_PASSWORD müssen gesetzt sein');

  await loginAsAdmin(page, creds);
  await page.goto('/users/block-management');

  await expect(page).toHaveURL(/\/users\/block-management/);
  await expect(page.getByRole('heading', { name: 'User Blockierung verwalten' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByPlaceholder('User suchen (E-Mail, Name, ID)...')).toBeVisible();
});
