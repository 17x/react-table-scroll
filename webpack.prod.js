/* eslint-disable */
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.base.js');

module.exports = merge(common, {
  mode: 'production'
});