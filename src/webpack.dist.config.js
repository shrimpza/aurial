var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: "web",
  entry: path.resolve(__dirname, 'js'),
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: 'index.js'
  },
  plugins: [
		new webpack.DefinePlugin({
		  'process.env': {
		    NODE_ENV: JSON.stringify('production')
		  }
		}),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        dead_code: true
      }
    }),
    new HtmlWebpackPlugin({
      title: 'Aurial',
      template: 'src/index.html'
    }),
		new CopyWebpackPlugin([
			{from: 'src/css', to: 'css'},
			{from: 'README.md'}
		])
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
					"plugins": [
						["transform-react-jsx", { "pragma": "h" }]
					],
          "presets": ["es2015", "stage-0"]
        }
      }
    ]
  }
};
