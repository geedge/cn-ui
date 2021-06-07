module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    eqeqeq: 0, // 关闭必须使用全等
    'no-extend-native': 0,
    'vue/no-parsing-error': 0, // 关闭此项避免在{{}}中使用>、<号导致报错的问题
    'vue/no-use-v-if-with-v-for': 0, // vue2暂时关闭v-if和v-for写在一起的错误提示，到vue3后要遵守
    'no-useless-escape': 0,
    'no-eval': 0
  }
}
