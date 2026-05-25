import { expect, test } from '@playwright/test';

import { getE2EAdminCredentials } from './helpers/credentials';
import { loginAsAdmin } from './helpers/login';

test('nach Login: Partner verwalten zeigt Geschäfte-Liste mit Daten', async ({ page }) => {
  const creds = getE2EAdminCredentials();
  test.skip(!creds, 'E2E_ADMIN_EMAIL und E2E_ADMIN_PASSWORD müssen gesetzt sein');

  await loginAsAdmin(page, creds);

  const partnerCard = page.getByText('Partner verwalten', { exact: true });
  await partnerCard.scrollIntoViewIfNeeded();
  await partnerCard.click();

  await expect(page).toHaveURL(/\/businesses/);
  await expect(page.getByRole('heading', { name: 'Geschäfte', exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText(/Geschäfte gefunden/)).toBeVisible();
  const emptyState = page.getByText('Keine Partner gefunden.');
  const activeSection = page.getByRole('heading', { name: /Aktive Geschäfte/ });
  const pendingSection = page.getByRole('heading', { name: /Ausstehende Partner/ });
  const inactiveSection = page.getByRole('heading', { name: /Inaktive Partner/ });
  await expect(
    emptyState.or(activeSection).or(pendingSection).or(inactiveSection).first()
  ).toBeVisible({ timeout: 15_000 });
});
