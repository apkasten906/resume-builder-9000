// .eslintrc.cjs (root)
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', '@next/next'],
  extends: [
    'eslint:recommended',
    'plugin:@next/next/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-hardcoded-test-data': 'error',
  },
  overrides: [
    // Node config files
    {
      files: ['next.config.js', '*.config.js', '*.config.cjs', '*.config.mjs'],
      env: { node: true },
    },
    // Backend API (Node)
    {
      files: ['packages/api/**/*.{js,ts}'],
      env: { node: true, browser: false },
      rules: {
        '@next/next/no-html-link-for-pages': 'off',
        '@next/next/no-img-element': 'off',
      },
    },
    // Core library (Node)
    {
      files: ['packages/core/**/*.{js,ts}'],
      env: { node: true, browser: false },
    },
  ],
  // Register custom rules
  settings: {
    'import/resolver': {
      node: {
        paths: ['.'],
      },
    },
  },
  rulesDirectory: ['./eslint-rules'],
};

// Note: 'plugin:@next/next/recommended' includes rules from 'eslint-config-next'
// which is the official ESLint configuration for Next.js projects.
// This setup ensures that ESLint is properly configured for a Next.js project
// while also integrating Prettier for code formatting.
