// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    // Funções serverless do BFF (`/api/*`): rodam no Node do Vercel, usam
    // `process.env` e a API nativa de `req`/`res` — fora das regras do app.
    ignores: ['api/**', 'dist/**', 'coverage/**', 'playwright-report/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Prefixo `ap` (AngularPrime/Atelier) e não `app`: as diretivas
      // `apReveal`/`apParallax` são a convenção já usada no angular-atelier-north
      // para não colidir com prefixo de componente.
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ap',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
