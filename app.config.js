// app.config.js
const baseConfig = require('./app.json');

module.exports = () => {
  return {
    ...baseConfig.expo,
    ios: {
      ...baseConfig.expo.ios,
      // EAS sets this to file path during builds
      // Falls back to local file for development
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
    },
  };
};
