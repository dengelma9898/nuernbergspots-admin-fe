import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect } from '@playwright/test';

import { getE2EAdminCredentials } from './helpers/credentials';
import { loginAsAdmin } from './helpers/login';

test('nach Login ist die CSV-Import-Seite erreichbar und zeigt Preview', async ({ page }) => {
  const creds = getE2EAdminCredentials();
  test.skip(!creds, 'E2E_ADMIN_EMAIL und E2E_ADMIN_PASSWORD müssen gesetzt sein');

  await loginAsAdmin(page, creds);
  await page.goto('/events/import/csv');

  await expect(page).toHaveURL(/\/events\/import\/csv/);
  await expect(page.getByRole('heading', { name: 'CSV Event Import' })).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'CSV-Format' }).click();
  await expect(page.getByRole('button', { name: 'Beispiel-CSV herunterladen' })).toBeVisible();

  await page.getByLabel('Vorschau vor Import').click();

  const fixturePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'fixtures',
    'events-minimal.csv'
  );
  await page.locator('input[type="file"]').setInputFiles(fixturePath);

  await expect(page.getByRole('checkbox', { name: /E2E Test Event auswählen/ })).toBeVisible({
    timeout: 15_000,
  });
});
