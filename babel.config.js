module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/env',
      {
        loose: true,
        modules: false
      }
    ],
    '@babel/typescript'
  ],
  plugins: [
    '@vue/babel-plugin-jsx',
    ['@babel/proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    '@babel/transform-runtime',
    'lodash'
  ],
  overrides: [
    {
      test: /\.vue$/,
      plugins: [
        '@babel/transform-typescript'
      ]
    }
  ],
  env: {
    utils: {
      ignore: [
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      presets: [
        [
          '@babel/env',
          {
            loose: true,
            modules: false
          }
        ]
      ],
      plugins: [
        [
          'babel-plugin-module-resolver',
          {
            root: ['element-plus'],
            alias: {
              '@element-plus': 'element-plus/lib'
            }
          }
        ]
      ]
    }
  }
}
