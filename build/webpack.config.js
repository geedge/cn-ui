/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const libMode = process.env.LIBMODE
const isFullMode = libMode === 'full'
const externals = [
  {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue'
    }
  }
]

const entry = path.resolve(__dirname, '../packages/element-plus/index.ts')

if (!isFullMode) {
  externals.push({
    '@popperjs/core': '@popperjs/core',
    'async-validator': 'async-validator',
    'mitt': 'mitt',
    'normalize-wheel': 'normalize-wheel',
    'resize-observer-polyfill': 'resize-observer-polyfill',
  },
  /^dayjs.*/,
  /^lodash.*/)
}

const config = {
  mode: 'production',
  entry,
  output: {
    path: path.resolve(__dirname, '../lib'),
    publicPath: '/',
    filename: isFullMode ? 'index.full.js' : 'index.js',
    libraryTarget: 'umd',
    library: 'ElementPlus',
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  cache: true,
  externals,
  plugins
}

const plugins = [
  new VueLoaderPlugin(),
  new CompressionWebpackPlugin({
    filename: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, // 匹配文件名
    threshold: 10240, // 对10K以上的数据进行压缩
    minRatio: 0.8,
    deleteOriginalAssets: false // 是否删除源文件
  })/*,
  new UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        warnings: false,
        drop_console: true
      }
    },
    exclude: /manifest.+js/,
    sourceMap: config.build.productionSourceMap,
    parallel: true
  })*/
  // new BundleAnalyzerPlugin(),
]

module.exports = config
