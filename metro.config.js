const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens',
      '@navigation': './src/navigation',
      '@services': './src/services',
      '@utils': './src/utils',
      '@assets': './src/assets',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
