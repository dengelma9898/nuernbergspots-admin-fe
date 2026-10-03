import { test, expect } from '@playwright/test';

import { getE2EAdminCredentials } from './helpers/credentials';
import { loginAsAdmin } from './helpers/login';

test('nach Login ist die Events-Seite erreichbar und unterstützt Filter-Chips sowie Mehr-Menü', async ({
  page,
}) => {
  const creds = getE2EAdminCredentials();
  test.skip(!creds, 'E2E_ADMIN_EMAIL und E2E_ADMIN_PASSWORD müssen gesetzt sein');

  await loginAsAdmin(page, creds);
  await page.goto('/events');
  await expect(page).toHaveURL(/\/events/);
  await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible({
    timeout: 30_000,
  });

  // Mehr-Menü prüfen
  const moreButton = page.getByRole('button', { name: 'Weitere Aktionen' });
  await expect(moreButton).toBeVisible();
  await moreButton.click();
  await expect(page.getByRole('menuitem', { name: /CSV Import/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /CSV Export/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Aktualisieren/i })).toBeVisible();
  await page.keyboard.press('Escape');

  // Filter-Chip-Flow mit Parametrisierung testen
  await page.goto('/events?status=future');
  const chip = page.getByRole('button', { name: /Filter Status: Kommend entfernen/i });
  await expect(chip).toBeVisible();
  await chip.click();
  await expect(chip).not.toBeVisible();

  // Differenzierter Empty-State bei Suche ohne Treffer
  await page.goto('/events?q=zzzzzzzzzz-kein-treffer');
  const emptyState = page.getByRole('status').filter({ hasText: 'Keine Events für die aktuelle' });
  await expect(emptyState).toBeVisible({ timeout: 30_000 });
  await emptyState.getByRole('button', { name: /Filter zurücksetzen/i }).click();
  await expect(page).not.toHaveURL(/q=/);

  // Sortierung sichtbar und per URL-Param steuerbar
  await page.goto('/events?sort=startDate-asc');
  await expect(page.getByRole('combobox', { name: 'Sortierung wählen' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page).toHaveURL(/sort=startDate-asc/);

  // Klickbares Pending-Badge prüfen, falls vorhanden
  const pendingButton = page.getByRole('button', { name: /ausstehende Events filtern/i });
  if (await pendingButton.isVisible()) {
    await pendingButton.click();
    await expect(page).toHaveURL(/approval=pending/);
  }
});
