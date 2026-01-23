// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  // Expo's React Native rules (includes React, RN globals, etc.)
  expoConfig,

  // Prettier integration - MUST be last to override conflicting rules
  eslintPluginPrettierRecommended,

  // Project-specific ignores
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'android/*',
      'ios/*',
      'coverage/*',
      '.husky/*',
      'functions/*', // Cloud Functions have their own lint config
      'patches/*',
      'scripts/*',
    ],
  },
]);
