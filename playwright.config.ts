import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { loadEnv } from 'vite';

// Gleiche Vite-Env wie `npm run start:dev` (--mode dev), damit webServer Firebase/API-URLs hat
const viteEnv = loadEnv('dev', process.cwd(), '');
for (const [key, value] of Object.entries(viteEnv)) {
  if (process.env[key] === undefined && value !== '') {
    process.env[key] = value;
  }
}

/** Einfaches KEY=VAL für E2E-Credentials (.env.e2e.local — nicht committen). */
function mergeDotenvFile(relativePath: string): void {
  const full = resolve(process.cwd(), relativePath);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

mergeDotenvFile('.env.e2e.local');
mergeDotenvFile('.env.e2e');

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start:dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
