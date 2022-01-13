const path = require('path');
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./module.js",
  context: path.join(__dirname, 'src'),
  output: {
    filename: "module.js",
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'amd',
  },

  resolve: {
    extensions: ['.ts', '.js', 'jsx', '.jsx', 'tsx'],
  },
  externals: [
    'lodash',
    'moment',
    'slate',
    'prismjs',
    'slate-plain-serializer',
    'slate-react',
    'react',
    'react-dom',
    function(context, request, callback) {
      var prefix = 'grafana/';
      if (request.indexOf(prefix) === 0) {
        return callback(null, request.substr(prefix.length));
      }
      callback();
    },
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
      },

      {
        test: /\.tsx?$/,
        loader:  'babel-loader',
            options: {
              presets: ['@babel/env']
            },
        exclude: /(node_modules)/,
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'plugin.json', to: '.' },
        { from: 'partials', to: 'partials'},
        { from: '../README.md', to: '.'},
        { from: '../src/img/**', to: '.'}
      ]
    })
  ],
}
