module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated v4 worklets are powered by react-native-worklets.
      // Its Babel plugin (successor to react-native-reanimated/plugin) is required
      // for entering/exiting/layout animations to run — including on web, where a
      // missing transform leaves animated items stuck at visibility:hidden.
      // Must be listed last.
      'react-native-worklets/plugin',
    ],
  };
};
