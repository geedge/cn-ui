module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-plugin-px2rem': {
      rootValue: 16,
      exclude: /node_modules/i,
      minPixelValue: 3,
      selectorBlackList: ['.html', 'iconfont', '.ttf', '.css']
    }
  }
}
