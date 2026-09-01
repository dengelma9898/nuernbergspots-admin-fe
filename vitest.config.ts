import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      // ESM-only Pakete, in Tests durch minimale Stubs ersetzt (siehe CONSTITUTION.md)
      'react-markdown': path.resolve(
        import.meta.dirname,
        './src/test-utils/mocks/react-markdown.tsx'
      ),
      'remark-gfm': path.resolve(import.meta.dirname, './src/test-utils/mocks/remark-gfm.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'e2e/**'],
    setupFiles: ['./src/setupTests.ts'],
    testTimeout: 10000,
    // Unreachable loopback port — wird nie kontaktiert (fetch ist gemockt); schlägt sofort fehl.
    env: {
      VITE_API_URL: 'http://127.0.0.1:5199/api',
      MODE: 'test',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts', 'src/test-utils/**', 'e2e/**'],
      // Baseline-Floor gegen Coverage-Regression (Ziel laut CONSTITUTION.md: 80-90 %)
      // v8 misst ~1-2 Punkte niedriger als das alte Istanbul+Jest; Floor daher auf
      // die gemessenen v8-Werte re-basiert (54/47/50/56).
      thresholds: {
        global: {
          statements: 54,
          branches: 47,
          functions: 50,
          lines: 56,
        },
      },
    },
  },
});
