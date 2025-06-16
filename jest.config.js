/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // TypeScript-Konfiguration für ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
      isolatedModules: true,
      diagnostics: {
        warnOnly: true,
      },
    }],
  },
  
  // Test-Dateien finden
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx}'
  ],
  
  // Setup-Dateien
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Module-Mapping für @ alias
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': 'jest-transform-stub'
  },
  
  // Coverage-Einstellungen
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  
  // Ignorierte Module
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  // Umgebungsvariablen für Tests
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:3000/api',
        MODE: 'test'
      }
    }
  }
}; 