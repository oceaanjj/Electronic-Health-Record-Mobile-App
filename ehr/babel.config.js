module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@features': './App/features',
          '@nurse': './App/features/nurse',
          '@components': './App/components',
          '@assets': './assets',
          '@api': './App/api',
          '@App': './App',
        },
      },
    ],
  ],
};