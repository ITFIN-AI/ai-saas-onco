const baseConfig = require('../../eslint.config');

module.exports = {
  ...baseConfig,
  extends: [...baseConfig.extends, 'eslint-config-react-app/base'],
  plugins: [...baseConfig.plugins, 'react-hooks'],
  rules: {
    ...baseConfig.rules,
    'react-hooks/exhaustive-deps': 'warn',
    'newline-before-return': 0,
    'react/display-name': 0,
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
    'jsx-a11y/anchor-is-valid': 0,
    'no-console': 2,
    complexity: 0,
  },
};
