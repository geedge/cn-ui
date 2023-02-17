module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    eqeqeq: 0, // 关闭必须使用全等
    'no-extend-native': 0,
    'vue/no-parsing-error': 0, // 关闭此项避免在{{}}中使用>、<号导致报错的问题
    'no-useless-escape': 0,
    'no-eval': 0,
    'no-trailing-spaces': 0
  }
}
