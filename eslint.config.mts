import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['playwright-report/**', 'test-results/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended', playwright.configs['flat/recommended']],
    languageOptions: { globals: globals.browser },
    rules: {
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
    },
  },
  {
    // POM uses force: true for Vue custom components (dropdown, checkboxes)
    files: ['tests/pages/**/*.ts'],
    rules: {
      'playwright/no-force-option': 'off',
    },
  },
  {
    // Happy path: assertions are in shared helpers (expectFormSubmitted) and POM (expect* methods)
    files: ['tests/smoke/voucher-happy.spec.ts'],
    rules: {
      'playwright/expect-expect': [
        'warn',
        { assertFunctionNames: ['expectFormSubmitted', 'expect*'] },
      ],
    },
  },
  {
    // Unhappy path: conditional expects handle CZ vs WL variant differences
    files: ['tests/smoke/voucher-unhappy.spec.ts'],
    rules: {
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
    },
  },
  tseslint.configs.recommended,
  prettier,
]);
