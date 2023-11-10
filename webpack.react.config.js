const nrwlConfig = require('@nrwl/react/plugins/webpack.js'); // require the main @nrwl/react/plugins/webpack configuration function.
const { ProvidePlugin, NormalModuleReplacementPlugin } = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (config, context) => {
  nrwlConfig(config, {});
  config.ignoreWarnings = [/Failed to parse source map/];
  config.resolve.mainFields = ['browser', 'module', 'main'];
  config.module.rules.push(
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    },
    {
      test: path.resolve(__dirname, 'libs/frontend/design-system/src/index.ts'),
      sideEffects: false,
    },
    {
      test: path.resolve(__dirname, 'libs/common/common/src/index.ts'),
      sideEffects: false,
    },
  );
  /**
   * To resolve @nestjs/swagger and class-transformer to a mocked version as it is not used in the frontend
   */
  config.resolve.alias = {
    '@nestjs/swagger': path.resolve(__dirname, 'mockNestJsSwagger.js'),
    'class-transformer': path.resolve(__dirname, 'mockClassTransformer.js'),
  };

  // ===========================================================================
  // Custom resolve fallback
  // ===========================================================================
  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    buffer: require.resolve('buffer'),
    stream: require.resolve('stream-browserify'),
    fs: require.resolve('fs-extra'),
    assert: require.resolve('assert'),
    constants: require.resolve('constants-browserify'),
    zlib: require.resolve('browserify-zlib'),
  };

  config.plugins.push(
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  // Minimise code
  if (config.mode === 'production') {
    config.optimization.minimize = true;
    config.optimization.minimizer.push(new TerserPlugin());
  }

  // To resolve "Uncaught ReferenceError: global is not defined"
  config.node = { global: true };
  return config;
};
