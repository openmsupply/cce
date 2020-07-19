module.exports = {
  extends: ['airbnb', 'prettier'],
  parser: 'babel-eslint',
  env: {
    jest: true,
  },
  rules: {
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'comma-dangle': 'off',
    'react/boolean-prop-naming': ['error', { rule: '^(is)[A-Z]([A-Za-z0-9]?)+' }],
    'react/default-props-match-prop-types': 'error',
    'import/prefer-default-export': 'off',
    'operator-linebreak': 'off',
    'global-require': 'off',
    'object-curly-newline': 'off',
  },
  globals: {
    fetch: false,
    __DEV__: true,
  },
};
