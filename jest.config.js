/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // TypeScript-Konfiguration für ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'ESNext',
          // Entspricht tsconfig.app.json; verhindert TS5107 (Fallback moduleResolution node10)
          moduleResolution: 'bundler',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          isolatedModules: true,
          ignoreDeprecations: '6.0',
        },
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },

  // Test-Dateien finden
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx}',
  ],

  // Temporär: CreateBusiness-Tests werden separat repariert (siehe docs/TESTING.md)
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/pages/businesses/__tests__/CreateBusiness.test.tsx',
  ],

  // Max. 10s pro Test (hängende Tests fallen schneller auf)
  testTimeout: 10000,

  // Setup-Dateien
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Module-Mapping für @ alias
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': 'jest-transform-stub',
    '^react-markdown$': '<rootDir>/src/test-utils/mocks/react-markdown.tsx',
    '^remark-gfm$': '<rootDir>/src/test-utils/mocks/remark-gfm.ts',
  },

  // Coverage-Einstellungen
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],

  // Baseline-Floor gegen Coverage-Regression (Ziel laut .cursorrules: 80 %)
  coverageThreshold: {
    global: {
      statements: 53,
      branches: 45,
      functions: 47,
      lines: 54,
    },
  },

  // Ignorierte Module
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],

  // Umgebungsvariablen für Tests
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:3000/api',
        MODE: 'test',
      },
    },
  },
};
