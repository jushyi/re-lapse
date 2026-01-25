/**
 * Mock for @react-native-firebase/app
 *
 * This mock MUST be loaded first before other Firebase modules.
 * Provides the base Firebase app initialization.
 */

const mockApp = jest.fn(() => ({
  name: '[DEFAULT]',
  options: {
    apiKey: 'mock-api-key',
    appId: 'mock-app-id',
    projectId: 'mock-project-id',
  },
}));

const firebase = {
  app: mockApp,
  apps: [],
  initializeApp: jest.fn(() => mockApp()),
};

// Default export is a function that returns the app
const app = () => ({
  app: mockApp,
});

// Named exports
module.exports = app;
module.exports.default = app;
module.exports.firebase = firebase;
module.exports.mockApp = mockApp;
