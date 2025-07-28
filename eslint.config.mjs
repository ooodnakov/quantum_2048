import js from '@eslint/js';
import jest from 'eslint-plugin-jest';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly'
      }
    },
    rules: {}
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    ...jest.configs['flat/recommended']
  }
];
