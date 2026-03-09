// @ts-check
const eslint = require('@eslint/js');
const {defineConfig} = require('eslint/config');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }
]);
