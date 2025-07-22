module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'no-unused-vars': 'off', // Disable base rule as it can report incorrect errors
    'no-console': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', '.eslintrc.js'],
};