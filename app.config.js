// app.config.js
const baseConfig = require('./app.json');

module.exports = () => {
  const isProduction = process.env.APP_ENV === 'production';

  return {
    ...baseConfig.expo,
    ios: {
      ...baseConfig.expo.ios,
      // EAS sets this to file path during builds
      // Falls back to local file for development
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
      entitlements: {
        ...baseConfig.expo.ios.entitlements,
        'aps-environment': isProduction ? 'production' : 'development',
      },
    },
  };
};
