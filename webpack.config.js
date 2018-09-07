const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack');

const extractSass = new ExtractTextPlugin("static/css/[name].css"); // cssc处理
module.exports = {
  entry: {  // 多入口
    'index': './src/js/index.js',
    'admin': './src/js/admin.js',
    'login': './src/js/login.js'
  },
  output: {
    path: __dirname + "/dist/",
    filename: 'static/js/[name].js',
  },
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Nike',
      filename: 'index.html',
      inject: true,
      hash: true,
      template: './index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      title: 'Login',
      inject: true,
      filename: 'login.html',
      hash: true,
      template: './login.html',
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      title: 'Admin',
      inject: true,
      filename: 'list.html',
      hash: true,
      template: './list.html',
      chunks: ['admin']  // 指定需要引入的js
    }),
    new HtmlWebpackPlugin({
      title: 'system_set',
      inject: true,
      filename: 'system_set.html',
      hash: true,
      template: './system_set.html',
      chunks: ['admin']  // 指定需要引入的js
    }),


    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: __dirname + '/src/js/lib',
        to: __dirname + '/dist/static/js'
      },
      {
        from: __dirname + '/src/imgs/',
        to: __dirname + '/dist/static/imgs'
      }
    ]),
    extractSass,
    // adminSass
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
    },
    {
      test: /\.(png|jpg|gif|jpeg)/,
      use: [
        {
          loader: 'file-loader',
          options: {
            outputPath: "imgs/"
          }
        }
      ]
    },
    {
      test: /\.(eot|svg|ttf|woff)\??.*/,
      use: {
        loader: 'url-loader?name=fonts[name].[md5:hash:hex:7].[ext]'
      }
    }
    
    ]
  },
  devServer: {
    contentBase: './dist',
    host: '192.168.1.100',
    // host: '192.168.123.70',
    port: 2000,
    hot: true,
    proxy: {
      '/admin/api': {
        // target: "http://photo-moments.yxking.xyz",
        target: "http://test.photo-moments.yxking.xyz",
        changeOrigin: true,
      },
      '/api': {
        target: "http://test.photo-moments.yxking.xyz",
        changeOrigin: true,
      }
    }
  },
};