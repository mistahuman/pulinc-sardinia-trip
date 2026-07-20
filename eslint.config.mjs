// @ts-check
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  // JS/MJS config files (Node environment)
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  // Svelte files
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        parser: tsparser,
      },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      // Base ESLint reads the parameter names inside a TypeScript function type
      // (`onSelect: (id: string) => void`) as unused variables. The TS-aware
      // rule understands they're part of the annotation — same swap the .ts
      // block above already gets from the recommended preset.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Astro files
  ...astro.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', '.astro/'],
  },
];
