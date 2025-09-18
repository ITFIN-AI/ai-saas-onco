const globals = require('globals');
const eslintRecommended = require('@eslint/js').configs.recommended;
const reactRecommended = require('eslint-plugin-react').configs.recommended;
const tseslint = require('@typescript-eslint/eslint-plugin');
const prettierConfig = require('eslint-plugin-prettier').configs.recommended;

module.exports = [
  eslintRecommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/android/**',
      '**/ios/**',
    ],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      'jest': require('eslint-plugin-jest'),
      '@typescript-eslint': tseslint,
      'react': require('eslint-plugin-react'),
      'prettier': require('eslint-plugin-prettier'),
    },
    rules: {
      ...reactRecommended.rules,
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      '@typescript-eslint/no-explicit-any': 1,
      '@typescript-eslint/explicit-function-return-type': 0,
      'react/prop-types': 0,
      'prettier/prettier': 0,
      complexity: 0,
      'no-console': 2,
      'jsx-a11y/anchor-is-valid': 'error',
      'newline-before-return': 1,
      'object-shorthand': 1,
      'comma-dangle': 0,
      'no-extra-boolean-cast': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/ban-types': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      'no-case-declarations': 0,
      '@typescript-eslint/interface-name-prefix': 0,
      'react/no-unescaped-entities': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        'babel-module': {
          '@': './src',
        },
        node: {
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.android.js',
            '.android.jsx',
            '.android.ts',
            '.android.tsx',
            '.ios.js',
            '.ios.jsx',
            '.ios.ts',
            '.ios.tsx',
            '.web.js',
            '.web.jsx',
            '.web.ts',
            '.web.tsx',
            '.d.ts',
          ],
        },
      },
    },
  },
];
