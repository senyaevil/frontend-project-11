export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
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
        // Node.js globals (для тестов)
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // Строгие правила стиля
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'brace-style': ['error', 'stroustrup'],
      'arrow-parens': ['error', 'as-needed'],
      'indent': ['error', 2],

      // Строгие правила кода
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-console': 'off', // Разрешаем console для отладки
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]
