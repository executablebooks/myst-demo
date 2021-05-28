const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const webpack = require('webpack');

module.exports = {
  optimization: {
    usedExports: true,
  },
  entry: {
    app: './myst.ts',
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'myst-demo',
      template: 'public/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/markdown-it-myst/dist/myst.css', to: 'myst.css' },
      ],
    }),
  ],
  externals: {
    katex: 'katex',
  },
  output: {
    filename: 'myst-demo.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
