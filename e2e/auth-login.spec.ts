import { test } from '@playwright/test';

import { getE2EAdminCredentials } from './helpers/credentials';
import { loginAsAdmin } from './helpers/login';

test('nach Login landet man auf dem Dashboard', async ({ page }) => {
  const creds = getE2EAdminCredentials();
  test.skip(!creds, 'E2E_ADMIN_EMAIL und E2E_ADMIN_PASSWORD müssen gesetzt sein');

  await loginAsAdmin(page, creds);
});
