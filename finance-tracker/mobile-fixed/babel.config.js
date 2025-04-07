module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Important! Ensure NativeWind plugin comes before Reanimated
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
}; 