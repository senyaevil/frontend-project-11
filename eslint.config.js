export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Set: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        Promise: 'readonly',
        URL: 'readonly',
        DOMParser: 'readonly',
        XMLSerializer: 'readonly',
      },
    },
    rules: {
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-unused-vars': 'error',
      'brace-style': ['error', 'stroustrup'],
      'arrow-parens': ['error', 'as-needed'],
    },
  },
]
