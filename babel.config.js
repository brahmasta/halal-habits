module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated v4 + New Architecture (Expo SDK 52+, RN 0.73+):
    // the Babel plugin is no longer needed — worklets are handled at native level.
  };
};
