module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  clearMocks: true,
  forceExit: true,
  detectOpenHandles: true,
  verbose: true,
};
