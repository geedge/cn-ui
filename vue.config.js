const path = require('path')
function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  css: {
    /* loaderOptions: {
      // scss变量全局应用
      scss: {
        prependData: '@import "~@/assets/css/main.scss";'
      }
    }, */
    sourceMap: false // 开启浏览器调试css定位
  },
  chainWebpack: (config) => {
    config.resolve.alias // 路径别名
      .set('@', resolve('./src'))
  },
  lintOnSave: true,
  devServer: {
    port: 80
  }
}
