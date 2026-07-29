import { test, expect } from '@playwright/test';

import { getE2EAdminCredentials } from './helpers/credentials';
import { loginAsAdmin } from './helpers/login';

test('nach Login ist die Events-Seite erreichbar', async ({ page }) => {
  const creds = getE2EAdminCredentials();
  test.skip(!creds, 'E2E_ADMIN_EMAIL und E2E_ADMIN_PASSWORD müssen gesetzt sein');

  await loginAsAdmin(page, creds);
  await page.goto('/events');
  await expect(page).toHaveURL(/\/events/);
  await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible({
    timeout: 30_000,
  });
});
