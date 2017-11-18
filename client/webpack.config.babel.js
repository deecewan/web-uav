/* @noflow */

import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import BabelMinifier from 'babel-minify-webpack-plugin';
import HTMLPlugin from 'html-webpack-plugin';

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, './.babelrc')));
const envIndex = config.presets.findIndex(preset => preset[0] === 'env');
console.log(envIndex);
config.presets[envIndex][1].modules = false;

console.log(JSON.stringify(config, null, 2));


const DEV_MODE = process.env.NODE_ENV === 'development';

const devEntryAdditions = [
  'react-hot-loader/patch',
  'webpack-hot-middleware/client',
  // 'webpack-dev-server/client?http://localhost:8080',
];

export default {
  entry: {
    app: []
      .concat(DEV_MODE ? devEntryAdditions : [])
      .concat(path.resolve(__dirname, './src/index.jsx')),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static',
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: /.jsx?$/,
      exclude: /node_modules/,
      use: [{
        options: config,
        loader: 'babel-loader',
      }],
    }],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  devtool: DEV_MODE ? 'inline-source-map' : 'source-map',
  plugins: [
    new HTMLPlugin({ template: path.join(__dirname, 'src', 'index.html') }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
  ].concat(DEV_MODE ? [
    // development plugins
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ] : [
    // production plugins
    new BabelMinifier(),
    new webpack.HashedModuleIdsPlugin(),
  ]),
};
