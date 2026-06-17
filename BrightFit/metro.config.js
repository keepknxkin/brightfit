const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// When Supabase cloud is used (production builds), resolve compiled dist files.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@supabase/realtime-js') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/@supabase/realtime-js/dist/main/index.js',
      ),
      type: 'sourceFile',
    };
  }

  if (
    moduleName.includes('websocket-factory') ||
    moduleName.endsWith('lib/websocket-factory')
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js',
      ),
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
