module.exports = {
  roots: [
    '<rootDir>/test'
  ],
  testMatch: [
    '<rootDir>/test/**/__tests__/**/*.{vue,js,jsx,ts,tsx}',
    '<rootDir>/test/**/*.{spec,test}.{vue,js,jsx,ts,tsx}'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/init.js'],
  verbose: true,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss|less)$'
  ],
  moduleFileExtensions: [
    'vue',
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1'
  },
  resetMocks: true
}
