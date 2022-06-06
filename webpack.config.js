const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin');
const StringReplaceLoader = require('string-replace-loader');

module.exports = (env, argv) => ({
  entry: {
    main: path.join(__dirname, './src/index.js'),
  },
  devtool: argv.mode === 'production' ? false : 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    chunkFilename:
      argv.mode === 'production'
        ? 'chunks/[name]-[chunkhash].js'
        : 'chunks/[name].js',
    filename:
      argv.mode === 'production' ? '[name]-[chunkhash].js' : '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
        ]
      },
      {
        test: /index\.js/,
        loader: 'string-replace-loader',
        options: {
          search: 'var firebaseConfig = {};',
          replace: "var firebaseConfig =  await (await fetch('/__/firebase/init.json')).json();",
        }
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/.\/__\/firebase\/init\.json/),
    new CleanWebpackPlugin(),
    new WebpackMd5Hash(),
    new MiniCssExtractPlugin({
      filename:
        argv.mode === 'production'
          ? '[name].[contenthash].css'
          : '[name].css'
    }),
    new HtmlWebpackPlugin({
      scriptLoading: 'blocking',
      templateContent: `<!DOCTYPE html>
          <html>
          </html>`,
      inject: true,
      hash: true,
      // template: './index.html',
      filename: 'index.html'
    }),
    new HtmlWebpackPartialsPlugin({
      path: path.join(__dirname, './src/index.html'),
      priority: 'high',
      location: 'html'
    }),
    // new HtmlWebpackPartialsPlugin({
    //   path: path.join(__dirname, './firebase.html'),
    //   location: 'html'
    // }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'src'),
    port: 8080,
    hot: true,
    open: true,
    proxy: {
      '/__': 'http://localhost:5000'
    }
  }
});
