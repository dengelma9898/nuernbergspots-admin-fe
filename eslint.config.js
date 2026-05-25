import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'build/**',
      '**/*.min.js',
      '**/*.min.css',
      '.vscode/**',
      '.idea/**',
      '.DS_Store',
      'Thumbs.db',
      '.firebase/**',
      '**/*.log',
      'vite-env.d.ts',
      'setupTests.ts',
      'tailwind.config.ts',
      // Test files
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**',
      'e2e/**',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Klassische React-Hooks-Regeln (rules-of-hooks + exhaustive-deps).
      // React-Compiler-Regeln aus eslint-plugin-react-hooks v7 bewusst ausgeschlossen:
      // Sie erfordern eine Compiler-Migration im gesamten Codebase (~60+ Fehler).
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript Rules (lockerer für den Anfang — Warnungen blockieren validate nicht)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-namespace': 'warn',

      // Basic Best Practices
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-empty': 'warn',
    },
  }
);
