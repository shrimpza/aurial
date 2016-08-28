var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'js'),
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: 'index.js'
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.ProvidePlugin({
     'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    }),
    new HtmlWebpackPlugin({
      title: 'Aurial',
      template: 'src/index.html'
    }),
    new CopyWebpackPlugin([{
      from: 'src/css',
      to: 'css'
    }])
  ],
  module: {
    loaders: [
      {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/,
          query: {
            "plugins": [],
            "presets": ["es2015", "stage-0", "react"]
          }
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  }
};
