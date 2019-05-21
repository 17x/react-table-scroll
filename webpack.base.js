/* eslint-disable */
const path = require('path')
const webpack = require('webpack')

let entry = './src/index'

let plugins = []

let optimization = {}

let modules = {
  rules: [{
    test: /\.js$/,
    include: path.resolve(__dirname, 'src'),
    exclude: /(node_modules|bower_components|build)/,
    use: {
      loader: 'babel-loader'
    }
  }, {
    test: /\.css$/,
    exclude: /node_modules/,
    use: [{
      loader: 'style-loader'
    }, {
      loader: 'css-loader'
    }]
  }]
}

let output = {
  path: path.resolve(__dirname, 'build'),
  filename: 'index.min.js',
  libraryTarget: 'commonjs2'
}

let resolve = {}

let externals = {
  'react': 'commonjs react'
}

module.exports = {
  entry,
  module: modules,
  plugins,
  output,
  resolve,
  optimization,
  externals
}