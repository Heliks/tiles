const CopyWebpackPlugin = require('copy-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    index: 'index.html',
    hot: true,
    port: 9000,
    stats: {
      maxModules: 0
    }
  },
  mode: 'none',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts(x?)$/,
        use: 'ts-loader'
      }
    ]
  },
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: true
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([
      // Copies the ./www directory to the build folder.
      {
        context: 'www',
        from: '**/*',
        to: '.'
      }
    ])
  ],
  resolve: {
    extensions: [
      '.tsx',
      '.ts',
      '.js'
    ]
  }
};
