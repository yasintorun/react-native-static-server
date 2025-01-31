// metro.config.js
//
// with multiple workarounds for this issue with symlinks:
// https://github.com/facebook/metro/issues/1
//
// with thanks to @johnryan (<https://github.com/johnryan>)
// for the pointers to multiple workaround solutions here:
// https://github.com/facebook/metro/issues/1#issuecomment-541642857
//
// see also this discussion:
// https://github.com/brodybits/create-react-native-module/issues/232

const path = require('path')
const blacklist = require('metro-config/src/defaults/blacklist');
const watchFolders = [
  //Relative path to packages directory because I'm in yarn workpspaces
  path.resolve(__dirname + "/../.."),
];
module.exports = {
  // workaround for an issue with symlinks encountered starting with
  // metro@0.55 / React Native 0.61
  // (not needed with React Native 0.60 / metro@0.54)
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        //experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: new Proxy(
      {},
      { get: (_, name) => path.resolve('.', 'node_modules', name) }
    ),

    blacklistRE: blacklist([
      /node_modules\/.*\/node_modules\/react-native\/.*/,
    ])
  },

  // quick workaround for another issue with symlinks
  watchFolders: ['.', '..']
}
