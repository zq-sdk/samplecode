module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-essential'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
  globals: {
    MessageSDK: 'readonly',
    Aliplayer: 'readonly',
  },
  // 忽略的文件
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'public/lib/**',
    'public/plugin/**',
    '*.min.js',
  ],
}
