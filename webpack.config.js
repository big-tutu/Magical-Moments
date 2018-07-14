const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack');

const extractSass = new ExtractTextPlugin({
  filename: "css/styles.css",
  // disable: process.env.NODE_ENV === "development"
});

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Nike',
      inject: true,
      hash: true,
      template: './index.html'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: __dirname + '/src/js/lib',
        to: __dirname + '/dist/js'
      },
      {
        from: __dirname + '/src/imgs/',
        to: __dirname + '/dist/imgs'
      }
    ]),
    extractSass
  ],
  module: {
    rules: [{
      test: /\.scss$/,
      use: extractSass.extract({
        use: [{
          loader: "css-loader"
        }, {
          loader: "sass-loader"
        }],
        // 在开发环境使用 style-loader
        fallback: "style-loader"
      })
    }]
  },
  devServer: {
    contentBase: './dist',
    host: '192.168.1.100',
    hot: true
  },
};